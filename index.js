const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static("./uploads"));

app.get("/", (req, res) => {
  return res.json({ message: "Hello world" });
});

app.post("/", upload.single("picture"), async (req, res) => {
  fs.access("./uploads", (error) => {
    if (error) {
      fs.mkdirSync("./uploads");
    }
  });

  const { buffer, originalname } = req.file;
  let ref = `${originalname}-${Date.now()}.jpeg`;

  const image = await sharp(buffer);
  const metadata = await image.metadata();
  console.log(metadata.width, metadata.height);

  let param;
  let value = 0;

  // check height and width of the image
  if (req.file.size > 100000) {
    if (metadata.width > metadata.height) {
      console.log("if");
      if (metadata.width <= 1920) {
        value = Math.round(metadata.width * (40 / 100));
        param = {
          width: value,
        };
      } else {
        value = Math.round(metadata.width * (10 / 100));
        param = {
          width: value,
        };
      }
    } else {
      console.log("else");
      if (metadata.height <= 1920) {
        value = Math.round(metadata.height * (40 / 100));
        param = {
          height: value,
        };
      } else {
        value = Math.round(metadata.height * (10 / 100));
        param = {
          height: value,
        };
      }
    }
  }

  // check buffer
  let newBuffer;
  try {
    newBuffer = await sharp(buffer)
      .resize(param)
      .jpeg({ quality: 60 })
      .toBuffer();

    // compress again
    if (newBuffer.length > 20000) {
      await sharp(buffer)
        .resize(param)
        .jpeg({ quality: 10 })
        .toFile("./uploads/" + ref);
      const link = `http://localhost:3000/${ref}`;
      console.log("buffer", newBuffer.length);
      return res.json({ link });
    }
  } catch (error) {
    console.log(error);
  }

  // const quality = Math.round((100 * 150000) / req.file.size);

  // console.log("quality", (100 * 150000) / req.file.size);
  // const newWidth = Math.round(metadata.width * (10 / 100));

  try {
    await sharp(buffer)
      .resize(param)
      .jpeg({ quality: 60 })
      .toFile("./uploads/" + ref);
    const link = `http://localhost:3000/${ref}`;
    return res.json({ link });
  } catch (error) {
    console.log(error);
  }
});

// (100 * partialValue) / totalValue;

app.listen(3000, () => console.log("on 3000"));
