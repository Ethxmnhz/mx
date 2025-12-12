
import { Router } from "express";
import { authenticate } from '../middleware/auth.js';
import {
		createCourse, upload, deleteCourse, editCourse, getCourses, getCourseById, uploadCourseContent, getCourseContents, deleteCourseContent, getDashboardStats, listEnrollmentsByCourse, revokeEnrollment,
		moveModule, moveTopic, getAllUsers, getUserDetails
} from "../controllers/Admin.controller.js";
import * as AdminController from "../controllers/Admin.controller.js";

const safeUpdateModuleName = (req, res, next) => {
	if (typeof AdminController.updateModuleName === 'function') return AdminController.updateModuleName(req, res, next);
	console.error('updateModuleName handler not available');
	return res.status(500).json({ message: 'Server handler unavailable' });
};

const safeUpdateContent = (req, res, next) => {
	if (typeof AdminController.updateContent === 'function') return AdminController.updateContent(req, res, next);
	console.error('updateContent handler not available');
	return res.status(500).json({ message: 'Server handler unavailable' });
};

const router = Router();

// Move module order
router.put('/courses/:courseId/modules/:moduleId/move', authenticate, moveModule);
// Move topic/lesson order
router.put('/courses/:courseId/contents/:contentId/move', authenticate, moveTopic);
// Update module name
router.put('/courses/:courseId/modules/:moduleId', authenticate, safeUpdateModuleName);
// Update content metadata (title / preview) and support file replacement
router.put('/courses/:courseId/contents/:contentId', authenticate, upload.single('file'), safeUpdateContent);

// Accept both thumbnail and certification preview images
router.post(
	"/coursecreation",
	authenticate,
	upload.fields([
		{ name: "thumbnail", maxCount: 1 },
		{ name: "certification_preview", maxCount: 1 }
	]),
	createCourse
);
router.put(
	"/courses/:id",
	authenticate,
	upload.fields([
		{ name: "thumbnail", maxCount: 1 },
		{ name: "certification_preview", maxCount: 1 }
	]),
	editCourse
);
router.delete("/courses/:id", authenticate, deleteCourse);
router.get("/courses", getCourses);
router.get("/courses/:id", getCourseById); // ✅ For prefill in edit mode
router.post("/courses/:courseId/contents", authenticate, upload.single("file"), uploadCourseContent);
router.get("/courses/:courseId/contents", authenticate, getCourseContents);

// Admin: enrollments
router.get('/courses/:courseId/enrollments', authenticate, listEnrollmentsByCourse);
router.delete('/enrollments/:enrollmentId', authenticate, revokeEnrollment);

// Delete individual content
router.delete("/courses/contents/:contentId", authenticate, deleteCourseContent);
router.get("/dashboard/stats", authenticate, getDashboardStats);

// User management
router.get("/users", authenticate, getAllUsers);
router.get("/users/:userId", authenticate, getUserDetails);

export default router


