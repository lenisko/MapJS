'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../services/config.js');

const loadAreas = () => {
    let areas = {};
    const restrictableKeys = ['pokemon', 'gyms', 'pokestops', 'spawnpoints', 'nests', 'portals'];

    const areasFilePath = path.resolve(__dirname, '../../static/custom/areas.json');
    try {
        const data = fs.readFileSync(areasFilePath, 'utf8');
        areas = JSON.parse(data);
    } catch (err) {
        for (const permKey of restrictableKeys) {
            if (Object.keys(config.discord.perms[permKey].areaRestrictions).length !== 0) {
                console.warn('[Area Restrictions] Disabled - `areas.json` file is missing or broken.');
                break;
            }
        }
    }
    return areas;
};

const parseAreas = (areasObj) => {
    let names = {};
    let polygons = {};

    if (Object.keys(areasObj).length === 0) return { names, polygons };

    for (const feature of areasObj.features) {
        // TODO: MultiPolygon support?
        if (feature.geometry.type == 'Polygon' && feature.properties.name) {
            polygons[feature.properties.name] = [];
            for (const polygonCoordinates of feature.geometry.coordinates) polygons[feature.properties.name].push(...polygonCoordinates);
        }
    }
    names = Object.keys(polygons);
    return { names, polygons };
};

const raw = loadAreas();
const { names, polygons } = parseAreas(raw);

module.exports = {
    raw,
    names,
    polygons
};
