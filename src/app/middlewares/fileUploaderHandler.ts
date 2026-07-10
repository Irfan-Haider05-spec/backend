// middlewares/fileUploaderHandler.ts

import { Request } from "express";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import ApiError from "../../errors/ApiErrors";

const fileUploadHandler = () => {
  const baseUploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      switch (file.fieldname) {
        case "image":
        case "profile":
        case "coverPhoto":
          uploadDir = path.join(baseUploadDir, "images");
          break;
        case "excel":
          uploadDir = path.join(baseUploadDir, "excels");
          break;
        default:
          throw new ApiError(StatusCodes.BAD_REQUEST, "File is not supported");
      }
      createDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

  const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    const imageFields = ["image", "profile", "coverPhoto"];
    if (imageFields.includes(file.fieldname)) {
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg"
      ) {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            "Only .jpeg, .png, .jpg supported"
          )
        );
      }
    } else if (file.fieldname === "excel") {
      if (
        file.mimetype ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.mimetype === "text/csv" ||
        file.mimetype === "application/vnd.ms-excel"
      ) {
        cb(null, true);
      } else {
        cb(
          new ApiError(StatusCodes.BAD_REQUEST, "Only .xlsx or .csv supported")
        );
      }
    } else {
      cb(new ApiError(StatusCodes.BAD_REQUEST, "This file is not supported"));
    }
  };

  const upload = multer({ storage, fileFilter: filterFilter,limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }, }).fields([
    { name: "image", maxCount: 3 },
    { name: "profile", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
    { name: "excel", maxCount: 1 },
  ]);

  // Middleware: convert absolute paths to relative paths
  const middleware = (req: Request, res: any, next: any) => {
    upload(req, res, (err: any) => {
      if (err) return next(err);

      if (req.files) {
        const files = req.files as { [key: string]: Express.Multer.File[] };
        Object.keys(files).forEach((key) => {
          files[key].forEach((file) => {
            // Replace absolute path with relative path
            file.path = file.path
              .replace(process.cwd(), "")
              .split("\\")
              .join("/");
          });
        });
      }

      next();
    });
  };

  return middleware;
};

export default fileUploadHandler;
