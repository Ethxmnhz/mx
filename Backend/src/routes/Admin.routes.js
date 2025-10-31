
import { Router } from "express";
import {
		createCourse, upload, deleteCourse, editCourse, getCourses, getCourseById, uploadCourseContent, getCourseContents, deleteCourseContent, getDashboardStats, listEnrollmentsByCourse, revokeEnrollment,
		moveModule, moveTopic
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
router.put('/courses/:courseId/modules/:moduleId/move', moveModule);
// Move topic/lesson order
router.put('/courses/:courseId/contents/:contentId/move', moveTopic);
// Update module name
router.put('/courses/:courseId/modules/:moduleId', safeUpdateModuleName);
// Update content metadata (title / preview) and support file replacement
router.put('/courses/:courseId/contents/:contentId', upload.single('file'), safeUpdateContent);

// Accept both thumbnail and certification preview images
router.post(
	"/coursecreation",
	upload.fields([
		{ name: "thumbnail", maxCount: 1 },
		{ name: "certification_preview", maxCount: 1 }
	]),
	createCourse
);
router.put(
	"/courses/:id",
	upload.fields([
		{ name: "thumbnail", maxCount: 1 },
		{ name: "certification_preview", maxCount: 1 }
	]),
	editCourse
);
router.delete("/courses/:id", deleteCourse);
router.get("/courses", getCourses);
router.get("/courses/:id", getCourseById); // ✅ For prefill in edit mode
router.post("/courses/:courseId/contents", upload.single("file"), uploadCourseContent);
router.get("/courses/:courseId/contents", getCourseContents);

// Admin: enrollments
router.get('/courses/:courseId/enrollments', listEnrollmentsByCourse);
router.delete('/enrollments/:enrollmentId', revokeEnrollment);

// Delete individual content
router.delete("/courses/contents/:contentId", deleteCourseContent);
router.get("/dashboard/stats", getDashboardStats);

export default router


