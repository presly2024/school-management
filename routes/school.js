import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { haversineDistance } from "../lib/distanceCalculator.js";

const router = Router();

router.get("/listSchools", async (req, res) => {
	const { latitude, longitude } = req.query;
	const lat = parseFloat(latitude);
	const lon = parseFloat(longitude);

	try {
		const schools = await prisma.school.findMany({});
		const sortedSchools = schools
			.map((school) => ({
				...school,
				distance: haversineDistance(
					lat,
					lon,
					school.latitude,
					school.longitude
				),
			}))
			.sort((a, b) => a.distance - b.distance)
			.map((school) => {
				const { distance, ...rest } = school;
				return { ...rest };
			});

		return res.status(200).json({ schools: sortedSchools });
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: true, msg: "Internal server error." });
	}
});

router.post("/addSchool", async (req, res) => {
	const { name, longitude, latitude, address } = req.body;
	if (!name.trim())
		return res.status(400).json({ error: true, msg: "Name is required" });
	if (!address.trim())
		return res
			.status(400)
			.json({ error: true, msg: "Address is required" });
	if (isNaN(latitude))
		return res
			.status(400)
			.json({ error: true, msg: "latitude must be a valid number" });
	if (isNaN(longitude))
		return res
			.status(400)
			.json({ error: true, msg: "longitude must be a valid number" });
	try {
		const newschool = await prisma.school.create({
			data: {
				name,
				address,
				latitude,
				longitude,
			},
		});

		if (!newschool)
			return res
				.status(400)
				.json({ error: true, msg: "Failed to add school." });
		const { id, ...payload } = newschool;
		return res.status(201).json({ ...payload });
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: true, msg: "Internal server error." });
	}
});

export default router;
