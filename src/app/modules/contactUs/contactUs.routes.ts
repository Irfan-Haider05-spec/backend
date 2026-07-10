import express from "express";
import { ContactController } from "./contactUs.controller";
import auth from "../../middlewares/auth";


const router = express.Router();

// Submit a contact message
router.post("/",auth(), ContactController.createContact);

// Get all contact messages (for admin)
router.get("/contact", auth(), ContactController.getAllContacts);

export const contactUsRoutes = router;
