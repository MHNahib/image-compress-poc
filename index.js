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

  // compress image
  //   console.log("file: ", req.file);
  const { buffer, originalname } = req.file;

  console.log("image size ", req.file.size);
  console.log("buffer size ", Buffer.byteLength(buffer));

  const ref = `${originalname}-${Date.now()}.webp`;
  const quality = Math.round((100 * 150000) / req.file.size);

  console.log("quality", (100 * 150000) / req.file.size);

  await sharp(buffer)
    .webp({ quality: quality })
    .toFile("./uploads/" + ref);
  const link = `http://localhost:3000/${ref}`;
  return res.json({ link });
});

// (100 * partialValue) / totalValue;

app.listen(3000, () => console.log("on 3000"));
