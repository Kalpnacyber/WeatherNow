import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Favorites are saved in favorites.json so they survive a server restart
const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "favorites.json");

function load() {
    try {
        return JSON.parse(fs.readFileSync(FILE, "utf-8"));
    } catch {
        return [];
    }
}

let favorites = load();

function save() {
    fs.writeFileSync(FILE, JSON.stringify(favorites, null, 2));
}

const sameCity = (a, b) => a.toLowerCase() === b.toLowerCase();

export function getFavorites() {
    return favorites;
}

export function addFavorite(city) {
    if (favorites.some((item) => sameCity(item.city, city.city))) {
        return false; // already exists
    }
    favorites.push(city);
    save();
    return true;
}

export function removeFavorite(cityName) {
    const index = favorites.findIndex((item) => sameCity(item.city, cityName));
    if (index === -1) return false;
    favorites.splice(index, 1);
    save();
    return true;
}
