const router = require("express").Router();
const https = require("https");
const mongoose = require('mongoose');
const User = require('../models/User1');

function generatePath(type, query) {
  let res = "/maps/api/place";
  type == "text"
    ? (res += `/textsearch/json?query=${query}`)
    : type == "details"
    ? (res += `/details/json?place_id=${query}&fields=place_id,name,formatted_address,formatted_phone_number,rating,opening_hours,photos,geometry`)
    : (res += `/nearbysearch/json?location=${query}`);
  res += `&key=${process.env.GOOGLE_KEY}&language=en`;
  return res;
}

async function googleFetch(method, type, query) {
  const options = {
    hostname: "maps.googleapis.com",
    port: 443,
    path: generatePath(type, query),
    method: `${method}`,
  };

  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        const results = JSON.parse(data);
        resolve(results);
      });
    });

    request.on("error", (error) => {
      console.error(
        "Грешка при изпращане на заявка към Google Places API:",
        error
      );
      reject(error);
    });

    request.end();
  });
}

async function wikiFetch(path) {
  const options = {
    hostname: "en.wikipedia.org",
    port: 443,
    path: path,
    method: `GET`,
  };

  return new Promise((resolve, reject) => {
    try {
      const request = https.request(options, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            const results = JSON.parse(data);
            resolve(results);
          } catch (error) {
            console.error("Грешка при парсиране на отговора:", error);
            resolve("");
          }
        });
      });

      request.on("error", (error) => {
        console.error(
          "Грешка при изпращане на заявка към Google Places API:",
          error
        );
        resolve("");
      });

      request.end();
    } catch (err) {
      resolve("");
    }
  });
}
router.post("/category", async (req, res) => {
  const type = "text";
  const method = "GET";
  const query = req.body.query;

  try {
    const results = await googleFetch(method, type, query);
    console.log(result);
    const filterPlaces = results.results
      .map((res) => {
        return {
          place_id: res.place_id,
          name: res.name,
          photos: res.photos ? res.photos[0]["photo_reference"] : "",
          rating: res.rating,
          types: res.types,
        };
      })
      .filter((a) => a.photos !== "");

    const result = {
      next_page_token: results.next_page_token,
      results: filterPlaces,
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Възникна грешка" });
  }
});

router.post("/destination", async (req, res) => {
  const type = "details";
  const method = "GET";
  const query = req.body.query;

  try {
    const result = await googleFetch(method, type, query);

    const wikiPageName = result.result.name.split(" ").join("-").trim();
    const findContent = await wikiFetch(
      `/w/api.php?action=query&format=json&list=search&srsearch=${wikiPageName}&sroffset=0&srlimit=1&uselang=content`
    );
    const resultContent = await wikiFetch(
      `/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&pageids=${
        findContent.query?.search[0]?.pageid || ""
      }`
    );
    const content =
      resultContent.query?.pages[findContent.query?.search[0]?.pageid]
        ?.extract || "";
    const photos = result.result.photos.map((p) => p.photo_reference);

    const filterPlace = {
      id: result.result.place_id,
      name: result.result.name,
      content: content,
      geometry: result.result.geometry.location,
      addres: result.result?.formatted_address || "",
      phone: result.result?.formatted_phone_number || "",
      opening_hours: {
        open_now: result.result.opening_hours?.open_now || "",
        weekday_text: result.result.opening_hours?.weekday_text || "",
      },
      photos: photos || "",
      rating: result.result?.rating || ""
    };

    res.json(filterPlace);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/place", async (req, res) => {
  const type = "details";
  const method = "GET";
  const query = req.body.id;

  try {
    const result = await googleFetch(method, type, query);
    const filterPlace = {
      addres: result.result?.formatted_address || "",
      phone: result.result?.formatted_phone_number || "",
      opening_hours: {
        open_now: result.result?.opening_hours?.open_now || "",
        weekday_text: result.result?.opening_hours?.weekday_text || "",
      },
    };

    res.json(filterPlace);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/destination/nearby/:category", async (req, res) => {
  const type = "nearby";
  const method = "GET";
  const lat = req.body.lat;
  const lng = req.body.lng;
  const url = req.params.category == "Restaurants" ? `${lat},${lng}&radius=10000&type=restaurant`: `${lat},${lng}&radius=10000&type=tourist_attraction&rankby=prominence`;
  try {
    const nearby = await googleFetch(
      method,
      type,
      url
    );
    
    const filterNearby = nearby.results
    .map((res) => {
      return {
        place_id: res.place_id,
        name: res.name,
        photos: res.photos ? res.photos[0]["photo_reference"] : "",
        rating: res.rating,
        types: res.types,
      };
    })
    .filter((i) => i.photos != "");


    res.json(filterNearby)

  } catch(err) {
    res.status(500).json({ error: err });
  }
})


router.post("/planning", async (req, res) => {
  const type = "text";
  const method = "GET";
  const query = `${(req.body.destination).split(' ').join('+')}+Bulgaria`;
  try {

    const user = await User.findById(req.body.userId);

    const result = await googleFetch(method, type, query);
    const exactMatchResults = result.results.filter(
      (result) => result.name.toLowerCase() == req.body.destination.toLowerCase()
    )[0];
    if (exactMatchResults.length < 1) {
      res.status(403);
      throw new Error("All fields are required", { cause: "destination" });
    } else {
      const destination = await googleFetch(
        method,
        "details",
        exactMatchResults.place_id
      );

      const wikiPageName = destination.result.name.split(" ").join("-").trim();

      const findContent = await wikiFetch(
        `/w/api.php?action=query&format=json&list=search&srsearch=${wikiPageName}&sroffset=0&srlimit=1&uselang=content`
      );
      const resultContent = await wikiFetch(
        `/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&pageids=${
          findContent.query?.search[0]?.pageid || ""
        }`
      );
      const content =
        resultContent.query?.pages[findContent.query?.search[0]?.pageid]
          ?.extract || "";
      const photos = destination.result.photos.map((p) => p.photo_reference);

      const filterPlace = {
        name: destination.result.name,
        content: content,
        geometry: destination.result.geometry.location,
        addres: destination.result?.formatted_address || "",
        phone: destination.result.formatted_phone_number || "",
        opening_hours: {
          open_now: destination.result.opening_hours?.open_now || "",
          weekday_text: destination.result.opening_hours?.weekday_text || "",
        },
        photos: photos || "",
        rating: destination.result.rating || "",
        placesToVisit: []
      };
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;
      const id = new mongoose.Types.ObjectId();
      user.createdTrips.push({id, ...filterPlace, startDate, endDate});

      await user.save();

      res.json(user);
    }

  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/search", async (req, res) => {
  const type = "text";
  const method = "GET";
  const query = `${(req.body.destination).split(' ').join('+')}+Bulgaria`;
  try {
    console.log(query);
    const result = await googleFetch(method, type, query);
    const filterResults = result.results.map((res) => {
      return {
        place_id: res.place_id,
        name: res.name,
        photos: res.photos ? res.photos[0]["photo_reference"] : "",
        rating: res.rating,
        types: res.types,
      };
    })
    .filter((i) => i.photos != "");
    console.log(result);
    // const filterResult = result.results.filter(
    //   (result) => result.name.toLowerCase() == req.body.destination.toLowerCase()
    // )[0];
    // if (filterResult.length < 1) {
    //   res.status(403);
    //   throw new Error("Cannot find destination", { cause: "destination" });
    // } else {
      // const destination = await googleFetch(
      //   method,
      //   "details",
      //   exactMatchResults.place_id
      // );

      // const wikiPageName = destination.result.name.split(" ").join("-").trim();

      // const findContent = await wikiFetch(
      //   `/w/api.php?action=query&format=json&list=search&srsearch=${wikiPageName}&sroffset=0&srlimit=1&uselang=content`
      // );
      // const resultContent = await wikiFetch(
      //   `/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&pageids=${
      //     findContent.query?.search[0]?.pageid || ""
      //   }`
      // );
      // const content =
      //   resultContent.query?.pages[findContent.query?.search[0]?.pageid]
      //     ?.extract || "";
      // const photos = destination.result.photos.map((p) => p.photo_reference);

    //   const destination = {
    //     place_id: filterResult.place_id,
    //     name: filterResult.name,
    //     photos: filterResult.photos ? filterResult.photos[0]["photo_reference"] : "",
    //     rating: filterResult.rating,
    //     types: filterResult.types,
    //   };

    //   res.json(result);
    // }
    res.json(filterResults);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});
module.exports = router;
