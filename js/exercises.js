"use strict";

// Exercise data and the methods used by the filters, gallery and search.
const exerciseLibrary = {
    items: [
        {
            id: "bench-press",
            name: "Bench Press",
            category: "upper",
            image: "images/Barbell-Bench-Press.gif",
            alt: "Barbell bench press movement",
            description: "A barbell pressing movement for the chest and upper body.",
            guide: "chest.html",
        },
        {
            id: "pull-up",
            name: "Pull-Ups",
            category: "upper",
            image: "images/Pull-up.gif",
            alt: "Pull-up movement on a horizontal bar",
            description: "A bodyweight pulling movement for the back and arms.",
            guide: "back.html",
        },
        {
            id: "overhead-press",
            name: "Overhead Press",
            category: "upper",
            image: "images/Overhead Press.gif",
            alt: "Standing barbell overhead press movement",
            description: "An overhead pressing movement for the shoulders.",
            guide: "shoulders.html",
        },
        {
            id: "squat",
            name: "Barbell Squat",
            category: "lower",
            image: "images/Barbell Squat.gif",
            alt: "Barbell squat movement",
            description: "A lower-body movement using a barbell and a controlled squat.",
            guide: "quads.html",
        },
        {
            id: "leg-press",
            name: "Leg Press",
            category: "lower",
            image: "images/Leg Press.gif",
            alt: "Seated leg press machine movement",
            description: "A machine-based pressing movement for the legs.",
            guide: "quads.html",
        },
        {
            id: "deadlift",
            name: "Romanian Deadlift",
            category: "lower",
            image: "images/Romanian Deadlift.gif",
            alt: "Romanian deadlift hip hinge movement",
            description: "A hip-hinge movement that focuses on the back of the legs.",
            guide: "hamstrings.html",
        },
        {
            id: "burpee",
            name: "Burpees",
            category: "conditioning",
            image: "images/Burpees.gif",
            alt: "Bodyweight burpee movement",
            description: "A bodyweight sequence combining a squat, plank and jump.",
            guide: "crossfit.html",
        },
        {
            id: "box-jump",
            name: "Box Jumps",
            category: "conditioning",
            image: "images/Box Jumps.gif",
            alt: "Box jump movement onto a raised platform",
            description: "A jumping movement using a stable raised platform.",
            guide: "crossfit.html",
        },
        {
            id: "kettlebell-swing",
            name: "Kettlebell Swing",
            category: "conditioning",
            image: "images/Kettlebell Swing.gif",
            alt: "Two-handed kettlebell swing movement",
            description: "A kettlebell movement driven by a controlled hip hinge.",
            guide: "crossfit.html",
        },
    ],

    // Returns one exercise, or undefined if the id is unknown.
    findById(id) {
        return this.items.find((exercise) => exercise.id === id);
    },

    // Returns the exercises for a filter button. An unknown category returns an empty list.
    getByCategory(category) {
        switch (category) {
            case "upper":
            case "lower":
            case "conditioning":
                return this.items.filter((exercise) => exercise.category === category);
            case "all":
                return [...this.items];
            default:
                return [];
        }
    },

    // Returns the text shown to the user for a category value.
    getCategoryLabel(category) {
        switch (category) {
            case "upper":
                return "Upper Body";
            case "lower":
                return "Lower Body";
            case "conditioning":
                return "CrossFit";
            default:
                return "All categories";
        }
    },
};
