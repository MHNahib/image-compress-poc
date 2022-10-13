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

  const image = await sharp(buffer);
  const metadata = await image.metadata();
  console.log(metadata.width, metadata.height);

  let quality = {};

  let width = 0;
  if (req.file.size > 100000) {
    if (metadata.width <= 320) width = Math.round(metadata.width * (60 / 100));
    else if (metadata.width <= 720)
      width = Math.round(metadata.width * (60 / 100));
    else if (metadata.width <= 1024)
      width = Math.round(metadata.width * (60 / 100));
    else if (metadata.width <= 1280)
      width = Math.round(metadata.width * (60 / 100));
    else if (metadata.width <= 1920)
      width = Math.round(metadata.width * (60 / 100));
    else width = Math.round(metadata.width * (10 / 100));
  }

  const ref = `${originalname}-${Date.now()}.jpeg`;
  // const quality = Math.round((100 * 150000) / req.file.size);

  // console.log("quality", (100 * 150000) / req.file.size);
  // const newWidth = Math.round(metadata.width * (10 / 100));
  console.log("new newWidth ", width);
  await sharp(buffer)
    .resize({ width: width })
    .jpeg({ quality: 60 })
    .toFile("./uploads/" + ref);
  const link = `http://localhost:3000/${ref}`;
  return res.json({ link });
});

// (100 * partialValue) / totalValue;

app.listen(3000, () => console.log("on 3000"));
