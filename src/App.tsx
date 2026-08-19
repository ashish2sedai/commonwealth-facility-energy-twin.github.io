"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Agency = { code: string; name: string };
type Facility = {
  id: string;
  name: string;
  agency: Agency;
  type: string;
  address: string;
  locality: string;
  lon: number;
  lat: number;
  area: number;
  floors: number;
  floorSource: string;
  year: number | null;
  peakLoad: number;
  pvCapacity: number;
  roofArea: number;
  roofUsableShare: number;
  roofConstraint: string;
  eui: number;
  seed: number;
};

const agencies: Agency[] = [
  { code: "MULTI", name: "Multiple Commonwealth agencies" },
  { code: "VGA", name: "Virginia General Assembly" },
  { code: "GOV", name: "Office of the Governor" },
  { code: "OAG", name: "Office of the Attorney General" },
  { code: "DGS", name: "Department of General Services" },
  { code: "VDACS", name: "Agriculture and Consumer Services" },
  { code: "VTC", name: "Virginia Tourism Corporation" },
  { code: "DVS", name: "Department of Veterans Services" },
  { code: "SCV", name: "Supreme Court of Virginia" },
  { code: "LVA", name: "Library of Virginia" },
  { code: "DMAS", name: "Department of Medical Assistance Services" },
  { code: "TAX", name: "Virginia Department of Taxation" },
  { code: "VDOT", name: "Department of Transportation" },
  { code: "VDH", name: "Department of Health" },
];

const loadProfile = [0.28,0.26,0.25,0.24,0.25,0.3,0.42,0.58,0.72,0.81,0.87,0.91,0.94,0.96,1,0.97,0.92,0.84,0.75,0.65,0.54,0.44,0.36,0.31];
const pvProfile = [0,0,0,0,0,0,0.05,0.2,0.42,0.63,0.79,0.91,1,0.97,0.88,0.72,0.5,0.27,0.08,0,0,0,0,0];

type FacilityRecord = Omit<Facility, "agency" | "peakLoad" | "pvCapacity" | "roofArea" | "roofUsableShare" | "roofConstraint" | "eui" | "seed"> & { agencyCode: string };

const facilityRecords: FacilityRecord[] = [
  { id:"DGS-738", name:"Virginia State Capitol", agencyCode:"VGA", type:"Capitol", address:"1000 Bank Street", locality:"Richmond", lon:-77.4353229, lat:37.5384975, area:110000, floors:3, floorSource:"Public architectural record", year:1788 },
  { id:"DGS-741", name:"General Assembly Building", agencyCode:"VGA", type:"Legislative office", address:"201 N. 9th Street", locality:"Richmond", lon:-77.4345646, lat:37.5399407, area:415000, floors:15, floorSource:"Published project record", year:2023 },
  { id:"DGS-706", name:"Patrick Henry Building", agencyCode:"GOV", type:"Executive office", address:"1111 E. Broad Street", locality:"Richmond", lon:-77.4320513, lat:37.5395616, area:155000, floors:8, floorSource:"DGS historic property record", year:1940 },
  { id:"DGS-739", name:"Virginia Executive Mansion", agencyCode:"GOV", type:"Executive residence", address:"203 Governor Street", locality:"Richmond", lon:-77.4319486, lat:37.5378263, area:32000, floors:2, floorSource:"Public architectural record", year:1813 },
  { id:"DGS-737", name:"Barbara Johns Building", agencyCode:"OAG", type:"Administrative office", address:"202 N. 9th Street", locality:"Richmond", lon:-77.4346472, lat:37.5400446, area:245000, floors:13, floorSource:"Virginia DGS facility record", year:1910 },
  { id:"DGS-701", name:"Oliver W. Hill Sr. Building", agencyCode:"VDACS", type:"Administrative office", address:"102 Governor Street", locality:"Richmond", lon:-77.4326454, lat:37.5369201, area:100000, floors:3, floorSource:"Virginia historic register", year:1894 },
  { id:"DGS-740", name:"Capitol Bell Tower", agencyCode:"VTC", type:"Visitor services", address:"Capitol Square", locality:"Richmond", lon:-77.4359300, lat:37.5379600, area:3500, floors:1, floorSource:"Published occupied-level record", year:1825 },
  { id:"DGS-727", name:"Reid's Row No. 1", agencyCode:"MULTI", type:"Historic office", address:"219 Governor Street", locality:"Richmond", lon:-77.4319005, lat:37.5379358, area:8000, floors:3, floorSource:"National Register record", year:1853 },
  { id:"DGS-728", name:"Reid's Row No. 2", agencyCode:"MULTI", type:"Historic office", address:"221 Governor Street", locality:"Richmond", lon:-77.4318946, lat:37.5379495, area:8000, floors:3, floorSource:"National Register record", year:1853 },
  { id:"DGS-748", name:"Reid's Row No. 3", agencyCode:"MULTI", type:"Historic office", address:"223 Governor Street", locality:"Richmond", lon:-77.4318887, lat:37.5379632, area:8000, floors:3, floorSource:"National Register record", year:1853 },
  { id:"DGS-702", name:"Washington Building", agencyCode:"DGS", type:"Administrative office", address:"1100 Bank Street", locality:"Richmond", lon:-77.4336380, lat:37.5374853, area:230000, floors:12, floorSource:"National Register record", year:1924 },
  { id:"DGS-731", name:"Virginia War Memorial", agencyCode:"DVS", type:"Museum and education", address:"621 S. Belvidere Street", locality:"Richmond", lon:-77.4490699, lat:37.5371941, area:80000, floors:2, floorSource:"Published facility plans", year:1955 },
  { id:"DGS-778", name:"Old City Hall", agencyCode:"MULTI", type:"Government office", address:"1001 E. Broad Street", locality:"Richmond", lon:-77.4330046, lat:37.5401272, area:140000, floors:4, floorSource:"National Historic Landmark record", year:1894 },
  { id:"DGS-709", name:"James Madison Building", agencyCode:"VDH", type:"Administrative office", address:"109 Governor Street", locality:"Richmond", lon:-77.4324989, lat:37.5368583, area:310000, floors:16, floorSource:"Virginia DGS facility record", year:1966 },
  { id:"DGS-733", name:"James Monroe Building", agencyCode:"MULTI", type:"Multi-agency office", address:"101 N. 14th Street", locality:"Richmond", lon:-77.4311210, lat:37.5361826, area:470895, floors:30, floorSource:"Virginia DGS facility record", year:null },
  { id:"DGS-777", name:"DCLS Biotech Laboratory", agencyCode:"DGS", type:"Public health laboratory", address:"600 N. 5th Street", locality:"Richmond", lon:-77.4347204, lat:37.5459217, area:165000, floors:4, floorSource:"Published facility record", year:1972 },
  { id:"DGS-703", name:"Jefferson Building", agencyCode:"MULTI", type:"Administrative office", address:"1220 Bank Street", locality:"Richmond", lon:-77.4331011, lat:37.5371626, area:260000, floors:15, floorSource:"Virginia DGS facility record", year:1956 },
  { id:"DGS-761", name:"Pocahontas Building", agencyCode:"MULTI", type:"Administrative office", address:"900 E. Main Street", locality:"Richmond", lon:-77.4362069, lat:37.5382296, area:360000, floors:15, floorSource:"Virginia DGS facility record", year:1913 },
  { id:"DGS-736", name:"Supreme Court of Virginia", agencyCode:"SCV", type:"Judicial office", address:"100 N. 9th Street", locality:"Richmond", lon:-77.4355021, lat:37.5391545, area:240000, floors:8, floorSource:"Virginia DGS facility record", year:1919 },
  { id:"DGS-771", name:"Library of Virginia", agencyCode:"LVA", type:"Library and archives", address:"800 E. Broad Street", locality:"Richmond", lon:-77.4346049, lat:37.5413884, area:450000, floors:6, floorSource:"Published building record", year:1996 },
  { id:"DGS-784", name:"Main Street Centre", agencyCode:"DMAS", type:"Administrative office", address:"600 E. Main Street", locality:"Richmond", lon:-77.4388979, lat:37.5398406, area:535000, floors:25, floorSource:"Virginia DGS facility record", year:1986 },
  { id:"DGS-783", name:"400 East Cary", agencyCode:"VDH", type:"Public health office", address:"400 E. Cary Street", locality:"Richmond", lon:-77.4415124, lat:37.5400476, area:49000, floors:4, floorSource:"Public property record", year:null },
  { id:"DGS-775", name:"Fleet Management Services", agencyCode:"DGS", type:"Fleet operations", address:"2400 W. Leigh Street", locality:"Richmond", lon:-77.4628871, lat:37.5619000, area:8750, floors:1, floorSource:"Public property record", year:null },
  { id:"DGS-723", name:"Surplus Property and State Mail", agencyCode:"DGS", type:"Warehouse", address:"1910 Darbytown Road", locality:"Richmond", lon:-77.3783506, lat:37.4957326, area:120000, floors:1, floorSource:"Public facility record", year:null },
  { id:"DGS-734", name:"Rose and Lafoon Building", agencyCode:"SCV", type:"Judicial office", address:"109 N. 8th Street", locality:"Richmond", lon:-77.4362273, lat:37.5396860, area:6426, floors:3, floorSource:"DGS facility condition report", year:1950 },
  { id:"DGS-785", name:"Westmoreland Building", agencyCode:"TAX", type:"Taxpayer service center", address:"1957 Westmoreland Street", locality:"Henrico", lon:-77.4861024, lat:37.5824302, area:85000, floors:2, floorSource:"Public property record", year:null },
  { id:"DGS-ANNEX", name:"VDOT Annex Building", agencyCode:"VDOT", type:"Transportation office", address:"1401 E. Broad Street", locality:"Richmond", lon:-77.4297248, lat:37.5381704, area:210000, floors:16, floorSource:"Commonwealth facility assessment", year:null },
  { id:"DGS-724", name:"Virginia Distribution Center", agencyCode:"DGS", type:"Distribution warehouse", address:"2400 Riley Ridge Road", locality:"Henrico", lon:-77.2812014, lat:37.5353483, area:780000, floors:1, floorSource:"Public facility record", year:null },
];

const officialFacilityImages: Record<string, string> = {
  "DGS-738": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1c8cfc05130320fdb3836fc548cf09f67a2a1d755.jpg?format=jpg&optimize=medium&width=750",
  "DGS-741": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_118194e01e85ed539440af90f551e01f85f54531b.jpg?format=jpg&optimize=medium&width=750",
  "DGS-706": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_13e7003553457c9a626498635103997f344d0aa50.jpg?format=jpg&optimize=medium&width=750",
  "DGS-739": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_15a2331e08c951bae40b15489ee1a6e99f82fa407.jpg?format=jpg&optimize=medium&width=750",
  "DGS-737": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1966f56b30052bb8a3fba428280f5405012be5bce.jpg?format=jpg&optimize=medium&width=750",
  "DGS-701": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1403269bc360970e1482397e9ff39d902b0cd99bb.jpg?format=jpg&optimize=medium&width=750",
  "DGS-740": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1ac65627095e59de92b0455516c65043bf16fcd1d.jpg?format=jpg&optimize=medium&width=750",
  "DGS-727": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1a6901276b28ff7526c8b8a66313fa51ae8f2a761.jpg?format=jpg&optimize=medium&width=750",
  "DGS-728": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1a6901276b28ff7526c8b8a66313fa51ae8f2a761.jpg?format=jpg&optimize=medium&width=750",
  "DGS-748": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1a6901276b28ff7526c8b8a66313fa51ae8f2a761.jpg?format=jpg&optimize=medium&width=750",
  "DGS-702": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1d0d4dc2f64a67a2ed4652ee596e7939aa84e210d.jpg?format=jpg&optimize=medium&width=750",
  "DGS-731": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_15e0dcb00225dba34b18de789ebeb7cd4aa5d24f5.jpg?format=jpg&optimize=medium&width=750",
  "DGS-778": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1883f8cd42fa006f8dd1698145c9c3f6cce0bafd0.jpg?format=jpg&optimize=medium&width=750",
  "DGS-709": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_13fe9ce5a5f82c132474e83aac9fed479c652e959.jpg?format=jpg&optimize=medium&width=750",
  "DGS-733": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_193afbc5623153f384b604fe913d84f1592524132.jpg?format=jpg&optimize=medium&width=750",
  "DGS-777": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1576da2a9decb868d6defa9c46b0480eeb3dc2fb3.jpg?format=jpg&optimize=medium&width=750",
  "DGS-703": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1cff5f1086dbfa5a229d3f843289e884015b91249.jpg?format=jpg&optimize=medium&width=750",
  "DGS-761": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1977f6872e19c9cf7179faff2c005e6c6112f403b.jpg?format=jpg&optimize=medium&width=750",
  "DGS-736": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1981295df637bf7b74bc89b74fcfe10116b75fc25.jpg?format=jpg&optimize=medium&width=750",
  "DGS-771": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1a043c83ceb1913e990595287acde68ac7b559ad2.jpg?format=jpg&optimize=medium&width=750",
  "DGS-784": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1e8e859e8b4ea1c2c20591a35eebd06f3130e0828.jpg?format=jpg&optimize=medium&width=750",
  "DGS-783": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_13ef6dbf7e0a70d1c0c32b5916696f9266d4adab6.jpg?format=jpg&optimize=medium&width=750",
  "DGS-775": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1e593ea81c35572062fb0ed5a4ba5a3b5e26bdb6b.jpg?format=jpg&optimize=medium&width=750",
  "DGS-723": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1f1669ebf824471347f2fc55f47a4204963d26b7e.jpg?format=jpg&optimize=medium&width=750",
  "DGS-785": "https://dgs.virginia.gov/dcss/dgs-facilities-information/media_1e4d376550c682aadeaa0ef541967f6fcd33c94b8.jpg?format=jpg&optimize=medium&width=750",
};

const agencyByCode = new Map(agencies.map((agency) => [agency.code, agency]));
function roofAssessment(record: FacilityRecord) {
  const historic = record.year !== null && record.year < 1935;
  if (record.id === "DGS-702") return { share: 0.58, constraint: "Open low-slope roof; allowances retained for perimeter safety, drainage, access and historic sightlines" };
  if (record.type.toLowerCase().includes("warehouse") || record.type.toLowerCase().includes("distribution")) return { share: 0.82, constraint: "Large low-slope roof; allowances retained for setbacks, drainage and equipment" };
  if (record.type.toLowerCase().includes("laboratory")) return { share: 0.58, constraint: "Mechanical and laboratory exhaust zones reduce usable roof" };
  if (record.type === "Capitol" || record.type.toLowerCase().includes("historic") || historic) return { share: 0.22, constraint: "Historic character, complex roof geometry and protected sightlines" };
  if (record.floors >= 15) return { share: 0.44, constraint: "Tower roof area reduced by mechanical penthouses, access and safety setbacks" };
  if (record.floors >= 6) return { share: 0.52, constraint: "Mechanical equipment, access paths and perimeter setbacks" };
  return { share: 0.62, constraint: "Preliminary allowance for equipment, shade, access and fire setbacks" };
}
const facilities: Facility[] = facilityRecords.map((record, index) => ({
  ...record,
  agency: agencyByCode.get(record.agencyCode) ?? agencies[0],
  peakLoad: Math.round(record.area * (0.0034 + (index % 5) * 0.00028)),
  roofArea: Math.round(record.area / record.floors),
  roofUsableShare: roofAssessment(record).share,
  roofConstraint: roofAssessment(record).constraint,
  pvCapacity: Math.min(5000, Math.round((record.area / record.floors) * roofAssessment(record).share * 0.012)),
  eui: 55 + ((index * 9) % 61),
  seed: index,
}));

function energyAt(facility: Facility, hour: number, roofCoverage = 100, dayOfYear = 172) {
  const date = new Date(Date.UTC(2026, 0, dayOfYear));
  const weekendFactor = [0, 6].includes(date.getUTCDay()) ? 0.68 : 1;
  const summerFactor = 1 + 0.14 * Math.cos((dayOfYear - 200) / 365 * Math.PI * 2);
  const winterFactor = 1 + 0.08 * Math.cos((dayOfYear - 15) / 365 * Math.PI * 2);
  const load = facility.peakLoad * loadProfile[hour] * (0.86 + (facility.seed % 9) * 0.018) * weekendFactor * Math.max(summerFactor, winterFactor);
  const solarSeasonFactor = 0.72 + 0.28 * Math.cos((dayOfYear - 172) / 365 * Math.PI * 2);
  const pv = facility.pvCapacity * (roofCoverage / 100) * pvProfile[hour] * (0.83 + (facility.seed % 7) * 0.025) * solarSeasonFactor;
  return { load: Math.round(load), pv: Math.round(pv), grid: Math.round(load - pv) };
}

function formatHour(hour: number) {
  if (hour === 0) return "12:00 AM";
  if (hour === 12) return "12:00 PM";
  return hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
}

function formatDay(dayOfYear: number) {
  return new Intl.DateTimeFormat("en-US", { month:"short", day:"numeric", timeZone:"UTC" }).format(new Date(Date.UTC(2026, 0, dayOfYear)));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function performanceClass(facility: Facility, hour: number, roofCoverage = 100, dayOfYear = 172) {
  const energy = energyAt(facility, hour, roofCoverage, dayOfYear);
  const coverage = energy.load ? energy.pv / energy.load : 0;
  if (coverage >= 0.65) return "high-solar";
  if (coverage >= 0.3) return "medium-solar";
  if (energy.pv > 0) return "low-solar";
  return "night-load";
}

type FootprintKind = "tower" | "podium-tower" | "slab" | "stepped" | "l" | "u" | "courtyard" | "cross" | "row" | "mansion" | "pavilion" | "warehouse" | "laboratory" | "monument";
type RoofKind = "flat" | "gable" | "hip" | "mansard" | "sawtooth" | "crown" | "cupola";
type FacilityModelProfile = {
  kind: FootprintKind;
  roof: RoofKind;
  facade?: "punched" | "ribbon" | "industrial";
  aspect: number;
  wall: number;
  glass: number;
  podiumFloors?: number;
  portico?: boolean;
  balustrade?: boolean;
  clockTower?: boolean;
  verticalFins?: boolean;
  groundColonnade?: boolean;
  label: string;
};

const modelProfiles: Record<string, FacilityModelProfile> = {
  "DGS-741": { kind:"podium-tower", roof:"flat", aspect:1.35, wall:0xd8d2c5, glass:0x31596b, podiumFloors:4, label:"General Assembly podium + tower" },
  "DGS-706": { kind:"stepped", roof:"crown", facade:"punched", aspect:1.05, wall:0xc8baa5, glass:0x263e48, label:"Stepped historic office" },
  "DGS-739": { kind:"mansion", roof:"flat", facade:"punched", aspect:1.75, wall:0xf1eee3, glass:0x263c42, portico:true, balustrade:true, label:"Executive Mansion + balustrade" },
  "DGS-737": { kind:"tower", roof:"mansard", facade:"punched", aspect:0.82, wall:0xb8aa91, glass:0x263f4d, label:"Historic vertical office" },
  "DGS-701": { kind:"u", roof:"hip", facade:"punched", aspect:1.45, wall:0xc4aa8d, glass:0x213c44, portico:true, label:"U-plan historic office" },
  "DGS-740": { kind:"monument", roof:"cupola", facade:"punched", aspect:0.8, wall:0xf0ecdf, glass:0x283f45, portico:true, label:"Capitol Bell Tower form" },
  "DGS-727": { kind:"row", roof:"gable", facade:"punched", aspect:0.48, wall:0xb16f52, glass:0x243b41, label:"Reid’s Row townhouse" },
  "DGS-728": { kind:"row", roof:"gable", facade:"punched", aspect:0.52, wall:0xa9654c, glass:0x243b41, label:"Reid’s Row townhouse" },
  "DGS-748": { kind:"row", roof:"gable", facade:"punched", aspect:0.5, wall:0xb87858, glass:0x243b41, label:"Reid’s Row townhouse" },
  "DGS-702": { kind:"u", roof:"flat", facade:"punched", aspect:1.18, wall:0xc9b691, glass:0x243c49, podiumFloors:2, portico:true, label:"Tapered V-plan Beaux-Arts Washington Building" },
  "DGS-731": { kind:"l", roof:"flat", aspect:2.15, wall:0xd4d2ca, glass:0x35596a, label:"War Memorial L-plan" },
  "DGS-778": { kind:"courtyard", roof:"mansard", facade:"punched", aspect:1.1, wall:0x9a785b, glass:0x233e48, clockTower:true, label:"Old City Hall atrium + clock tower" },
  "DGS-709": { kind:"slab", roof:"crown", aspect:1.7, wall:0xb5aaa0, glass:0x31586b, podiumFloors:2, label:"James Madison tower slab" },
  "DGS-733": { kind:"podium-tower", roof:"crown", aspect:1.0, wall:0xaeb4b4, glass:0x2c5668, podiumFloors:5, verticalFins:true, label:"James Monroe vertical tower + podium" },
  "DGS-777": { kind:"laboratory", roof:"flat", aspect:2.2, wall:0xc6c1b6, glass:0x315b67, label:"Biotech laboratory wings" },
  "DGS-703": { kind:"tower", roof:"flat", aspect:1.25, wall:0xb4ad9f, glass:0x2f5261, podiumFloors:2, label:"Jefferson office tower" },
  "DGS-761": { kind:"slab", roof:"flat", facade:"punched", aspect:1.65, wall:0xb8b0a3, glass:0x263d49, groundColonnade:true, label:"Pocahontas concrete office slab" },
  "DGS-736": { kind:"pavilion", roof:"flat", facade:"punched", aspect:1.55, wall:0xcac4b7, glass:0x293f4b, portico:true, label:"Supreme Court pavilion" },
  "DGS-771": { kind:"cross", roof:"flat", aspect:1.5, wall:0xb7b0a4, glass:0x2c5565, label:"Library stepped cross-plan" },
  "DGS-784": { kind:"podium-tower", roof:"crown", aspect:0.95, wall:0x9ea9aa, glass:0x245568, podiumFloors:5, label:"Main Street Centre tower" },
  "DGS-783": { kind:"l", roof:"flat", aspect:1.35, wall:0xa98d77, glass:0x294c59, label:"400 East Cary L-plan" },
  "DGS-775": { kind:"warehouse", roof:"gable", facade:"industrial", aspect:2.4, wall:0xa8a49b, glass:0x314b52, label:"Fleet service garage" },
  "DGS-723": { kind:"warehouse", roof:"sawtooth", facade:"industrial", aspect:3.1, wall:0xb9b4aa, glass:0x304950, label:"Mail + surplus warehouse" },
  "DGS-734": { kind:"row", roof:"gable", facade:"punched", aspect:0.7, wall:0xa87960, glass:0x263f46, label:"Rose and Lafoon row building" },
  "DGS-785": { kind:"l", roof:"hip", aspect:1.8, wall:0xc2b8a8, glass:0x2d4f59, label:"Westmoreland low-rise office" },
  "DGS-ANNEX": { kind:"slab", roof:"crown", aspect:1.25, wall:0xaab0ae, glass:0x2b5668, podiumFloors:2, label:"VDOT Annex tower slab" },
  "DGS-724": { kind:"warehouse", roof:"sawtooth", facade:"industrial", aspect:4.2, wall:0xbab7ae, glass:0x344c51, label:"Virginia Distribution Center" },
};

const defaultModelProfile: FacilityModelProfile = { kind:"slab", roof:"flat", aspect:1.35, wall:0xaeb6b3, glass:0x2b5360, label:"Building-specific massing" };
const LOAD_PROFILE_MEAN = loadProfile.reduce((sum, value) => sum + value, 0) / loadProfile.length;
const PLANNING_ELECTRICITY_RATE = 0.11;
const PLANNING_GRID_LB_CO2_PER_KWH = 0.7;

function modelProfileFor(facility: Facility) {
  return modelProfiles[facility.id] ?? defaultModelProfile;
}

function annualElectricityKwh(facility: Facility) {
  const diversity = 0.86 + (facility.seed % 9) * 0.018;
  return facility.peakLoad * LOAD_PROFILE_MEAN * diversity * 8760;
}

function impactAtCoverage(facility: Facility, coverage: number, electricityRate = PLANNING_ELECTRICITY_RATE, emissionsFactor = PLANNING_GRID_LB_CO2_PER_KWH) {
  let annualPvKwh = 0;
  let annualOffsetKwh = 0;
  for (let day = 1; day <= 365; day += 1) {
    for (let annualHour = 0; annualHour < 24; annualHour += 1) {
      const point = energyAt(facility, annualHour, coverage, day);
      annualPvKwh += point.pv;
      annualOffsetKwh += Math.min(point.load, point.pv);
    }
  }
  return {
    activePvCapacity: facility.pvCapacity * coverage / 100,
    grossRoofArea: facility.roofArea,
    technicallyUsableRoofArea: facility.roofArea * facility.roofUsableShare,
    selectedRoofArea: facility.roofArea * facility.roofUsableShare * coverage / 100,
    annualPvKwh,
    annualOffsetKwh,
    avoidedCost: annualOffsetKwh * electricityRate,
    avoidedTons: annualOffsetKwh * emissionsFactor / 2000,
  };
}

function compactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style:"currency", currency:"USD", notation:"compact", maximumFractionDigits:1 }).format(value);
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation:"compact", maximumFractionDigits:1 }).format(value);
}

type TwinViewMode = "exterior" | "rooftop";

function FacilityModel({ facility, hour, coverage, dayOfYear, energy, impact }: { facility: Facility; hour: number; coverage: number; dayOfYear: number; energy: ReturnType<typeof energyAt>; impact: ReturnType<typeof impactAtCoverage> }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef(hour);
  const coverageRef = useRef(coverage);
  const dayRef = useRef(dayOfYear);
  const viewModeRef = useRef<TwinViewMode>("exterior");
  const [fallback, setFallback] = useState(false);
  const [viewMode, setViewMode] = useState<TwinViewMode>("exterior");
  const selectedProfile = modelProfileFor(facility);

  useEffect(() => { hourRef.current = hour; }, [hour]);
  useEffect(() => { coverageRef.current = coverage; }, [coverage]);
  useEffect(() => { dayRef.current = dayOfYear; }, [dayOfYear]);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);

  const selectView = (mode: TwinViewMode) => {
    setViewMode(mode);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    setFallback(false);
    let disposed = false;
    let cleanup = () => {};

    const initializeModel = async () => {
    const [THREE, controlsModule, roundedBoxModule, environmentModule] = await Promise.all([
      import("three"),
      import("three/examples/jsm/controls/OrbitControls.js"),
      import("three/examples/jsm/geometries/RoundedBoxGeometry.js"),
      import("three/examples/jsm/environments/RoomEnvironment.js"),
    ]);
    if (disposed) return;
    const { OrbitControls } = controlsModule;
    const { RoundedBoxGeometry } = roundedBoxModule;
    const { RoomEnvironment } = environmentModule;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07131f, 0.035);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const isCapitol = facility.id === "DGS-738";
    const profile = modelProfileFor(facility);
    const floorPitch = isCapitol ? 0.78 : Math.max(0.18, Math.min(0.62, 7.2 / facility.floors));
    const buildingHeight = facility.floors * floorPitch;
    camera.position.set(isCapitol ? 13.5 : 12, isCapitol ? 7.2 : 7 + buildingHeight * 0.28, isCapitol ? 15.5 : 14);
    let renderer: InstanceType<typeof THREE.WebGLRenderer>;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      if (!disposed) setFallback(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.setClearColor(0x07131f, 0);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environmentTexture;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.32;
    controls.minPolarAngle = 0.12;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.minDistance = 8;
    controls.maxDistance = 24;
    controls.target.set(0, isCapitol ? 1.45 : buildingHeight * 0.45, 0);
    controls.addEventListener("start", () => { controls.autoRotate = false; });

    const skyLight = new THREE.HemisphereLight(0xc5e9ff, 0x152334, 2.1);
    scene.add(skyLight);
    const sun = new THREE.DirectionalLight(0xffefc5, 3.4);
    sun.position.set(-8, 13, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 45;
    sun.shadow.camera.left = -16;
    sun.shadow.camera.right = 16;
    sun.shadow.camera.top = 16;
    sun.shadow.camera.bottom = -16;
    sun.shadow.bias = -0.00025;
    sun.shadow.normalBias = 0.025;
    scene.add(sun);
    const accent = new THREE.PointLight(0x44dba0, 16, 20);
    accent.position.set(5, 7, -5);
    scene.add(accent);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(isCapitol ? 8.3 : 7.8, 64), new THREE.MeshStandardMaterial({ color: isCapitol ? 0x254c35 : 0x102334, roughness: 0.92 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const floorMaterials: Array<InstanceType<typeof THREE.MeshPhysicalMaterial>> = [];
    const floorBaseColors: Array<InstanceType<typeof THREE.Color>> = [];
    const panelMaterials: Array<InstanceType<typeof THREE.MeshStandardMaterial>> = [];
    const panelModules: Array<InstanceType<typeof THREE.Object3D>> = [];
    const windowMaterials: Array<InstanceType<typeof THREE.MeshStandardMaterial>> = [];
    const modelRoot = new THREE.Group();
    modelRoot.rotation.y = isCapitol ? -0.12 : ((facility.seed % 5) - 2) * 0.055;
    scene.add(modelRoot);
    let tourRoofY = isCapitol ? 2.9 : buildingHeight + 0.55;
    let tourWidth = isCapitol ? 2.3 : 5;
    let tourDepth = isCapitol ? 4.55 : 4;
    let tourCenterX = isCapitol ? 4.5 : 0;
    let tourCenterZ = isCapitol ? -0.05 : 0;
    let customRoofFields: Array<{ x: number; z: number; width: number; depth: number; y: number }> = [];
    const addBox = (dimensions: [number, number, number], position: [number, number, number], material: InstanceType<typeof THREE.Material>, parent = modelRoot) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...dimensions), material);
      mesh.position.set(...position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };
    const addRoundedBox = (dimensions: [number, number, number], position: [number, number, number], material: InstanceType<typeof THREE.Material>, radius: number, parent = modelRoot) => {
      const safeRadius = Math.min(radius, Math.min(...dimensions) * 0.24);
      const mesh = new THREE.Mesh(new RoundedBoxGeometry(...dimensions, 4, safeRadius), material);
      mesh.position.set(...position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // A restrained urban setting gives every model scale, contact shadows and
    // a Richmond streetscape reference without pretending to reproduce parcel
    // survey geometry.
    const siteContext = new THREE.Group();
    scene.add(siteContext);
    const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0x778086, roughness: 0.96, metalness: 0.02 });
    const streetMaterial = new THREE.MeshStandardMaterial({ color: 0x18242c, roughness: 0.93 });
    const markingMaterial = new THREE.MeshStandardMaterial({ color: 0xd9cda7, roughness: 0.82, emissive: 0x3c3524, emissiveIntensity: 0.05 });
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4d3929, roughness: 0.98 });
    const canopyMaterial = new THREE.MeshStandardMaterial({ color: isCapitol ? 0x2f6a43 : 0x2d5d49, roughness: 0.92 });
    const siteRing = new THREE.Mesh(new THREE.RingGeometry(6.35, 7.72, 64), sidewalkMaterial);
    siteRing.rotation.x = -Math.PI / 2;
    siteRing.position.y = 0.012;
    siteRing.receiveShadow = true;
    siteContext.add(siteRing);
    addBox([1.2, 0.035, 12.2], [-7.18, 0.025, 0], streetMaterial, siteContext);
    addBox([1.2, 0.035, 12.2], [7.18, 0.025, 0], streetMaterial, siteContext);
    addBox([12.2, 0.035, 1.2], [0, 0.025, -7.18], streetMaterial, siteContext);
    addBox([12.2, 0.035, 1.2], [0, 0.025, 7.18], streetMaterial, siteContext);
    [-7.18, 7.18].forEach((streetX) => addBox([0.035, 0.012, 9.6], [streetX, 0.052, 0], markingMaterial, siteContext));
    [-7.18, 7.18].forEach((streetZ) => addBox([9.6, 0.012, 0.035], [0, 0.052, streetZ], markingMaterial, siteContext));
    const treePositions: Array<[number, number, number]> = isCapitol
      ? [[-5.8,-5.25,0.66],[5.85,-5.05,0.72],[-6.05,4.8,0.8],[6.0,4.65,0.73],[-4.75,5.75,0.64],[4.65,5.7,0.7]]
      : [[-5.75,-5.2,0.58],[5.8,-5.0,0.62],[-5.95,4.85,0.7],[5.9,4.72,0.65],[-4.6,5.82,0.56],[4.72,5.76,0.6]];
    treePositions.forEach(([treeX, treeZ, scale]) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * scale, 0.1 * scale, 0.9 * scale, 10), trunkMaterial);
      trunk.position.set(treeX, 0.45 * scale, treeZ);
      trunk.castShadow = true;
      siteContext.add(trunk);
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(0.72 * scale, 1), canopyMaterial);
      canopy.position.set(treeX, 1.18 * scale, treeZ);
      canopy.scale.set(1, 1.12, 1);
      canopy.castShadow = true;
      canopy.receiveShadow = true;
      siteContext.add(canopy);
    });

    if (isCapitol) {
      // Reference reconstruction: 1 scene unit is approximately 20 feet.
      // HABS documents the Jefferson pavilion at about 84 × 150 feet with a
      // six-column, two-bay-deep Ionic portico. Street View guides the visible
      // stair, wing-portico, opening, cornice and roof details below.
      const stucco = new THREE.MeshPhysicalMaterial({ color: 0xeeeadd, roughness: 0.7, clearcoat: 0.08 });
      const brightStone = new THREE.MeshStandardMaterial({ color: 0xfaf6e9, roughness: 0.58 });
      const shadowStone = new THREE.MeshStandardMaterial({ color: 0xcfc9bb, roughness: 0.82 });
      const roofMetal = new THREE.MeshStandardMaterial({ color: 0x6f7772, roughness: 0.76, metalness: 0.18 });
      const brickWalk = new THREE.MeshStandardMaterial({ color: 0x9a5f45, roughness: 0.98 });
      const paving = new THREE.MeshStandardMaterial({ color: 0xb9ae9d, roughness: 0.96 });
      const columnMaterial = new THREE.MeshPhysicalMaterial({ color: 0xf8f4e8, roughness: 0.5, clearcoat: 0.12 });
      const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x253b38, roughness: 0.48, metalness: 0.14 });

      const addFrontWindow = (x: number, y: number, z: number, widthValue = 0.34, heightValue = 0.62) => {
        const material = new THREE.MeshStandardMaterial({ color: 0x172f34, emissive: 0x17383b, emissiveIntensity: 0.22, roughness: 0.22, metalness: 0.16 });
        windowMaterials.push(material);
        addBox([widthValue, heightValue, 0.052], [x, y, z], material);
        addBox([widthValue + 0.1, 0.055, 0.09], [x, y + heightValue / 2 + 0.045, z + 0.012], brightStone);
        addBox([widthValue + 0.08, 0.045, 0.08], [x, y - heightValue / 2 - 0.035, z + 0.012], shadowStone);
      };
      const addSideWindow = (x: number, y: number, z: number, widthValue = 0.32, heightValue = 0.58) => {
        const material = new THREE.MeshStandardMaterial({ color: 0x172f34, emissive: 0x17383b, emissiveIntensity: 0.22, roughness: 0.22, metalness: 0.16 });
        windowMaterials.push(material);
        addBox([0.052, heightValue, widthValue], [x, y, z], material);
        addBox([0.085, 0.055, widthValue + 0.1], [x, y + heightValue / 2 + 0.045, z], brightStone);
      };
      const addIonicColumn = (x: number, z: number, baseY: number, heightValue: number, radius: number) => {
        addBox([radius * 2.6, 0.07, radius * 2.6], [x, baseY + 0.035, z], brightStone);
        const lowerBase = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.25, radius * 1.4, 0.11, 24), columnMaterial);
        lowerBase.position.set(x, baseY + 0.12, z);
        lowerBase.castShadow = true;
        modelRoot.add(lowerBase);
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.82, radius, heightValue, 28), columnMaterial);
        shaft.position.set(x, baseY + 0.19 + heightValue / 2, z);
        shaft.castShadow = true;
        modelRoot.add(shaft);
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.05, radius * 0.85, 0.1, 24), columnMaterial);
        neck.position.set(x, baseY + 0.22 + heightValue, z);
        modelRoot.add(neck);
        const capitalY = baseY + 0.31 + heightValue;
        addBox([radius * 2.8, 0.11, radius * 2.35], [x, capitalY, z], brightStone);
        [-1, 1].forEach((direction) => {
          const volute = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.34, radius * 0.11, 8, 18), columnMaterial);
          volute.position.set(x + direction * radius * 0.78, capitalY - 0.005, z + radius * 1.18);
          volute.castShadow = true;
          modelRoot.add(volute);
        });
      };
      const addGable = (widthValue: number, roofY: number, z: number, depthValue: number, rise: number, material = brightStone) => {
        const shape = new THREE.Shape();
        shape.moveTo(-widthValue / 2, 0);
        shape.lineTo(0, rise);
        shape.lineTo(widthValue / 2, 0);
        shape.closePath();
        const gable = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: depthValue, bevelEnabled: false }), material);
        gable.position.set(0, roofY, z);
        gable.castShadow = true;
        modelRoot.add(gable);
        return gable;
      };

      // Capitol Square terrace, axial brick walk and stone landing.
      addBox([1.1, 0.035, 4.5], [0, 0.03, 6.25], brickWalk);
      addBox([6.2, 0.06, 1.7], [0, 0.04, 4.35], paving);
      addBox([10.8, 0.12, 5.3], [0, 0.12, -0.05], shadowStone);

      // Jefferson's central 5-by-9-bay pavilion (approx. 84 × 150 feet).
      addBox([4.2, 2.72, 6.15], [0, 1.85, -0.38], stucco);
      addBox([4.36, 0.18, 6.32], [0, 0.53, -0.38], shadowStone);
      addBox([4.46, 0.17, 6.35], [0, 3.18, -0.38], brightStone);
      addBox([4.5, 0.08, 6.4], [0, 3.31, -0.38], shadowStone);

      // Main metal gable roof and rear pediment.
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-2.23, 0); roofShape.lineTo(0, 0.78); roofShape.lineTo(2.23, 0); roofShape.closePath();
      const mainRoof = new THREE.Mesh(new THREE.ExtrudeGeometry(roofShape, { depth: 6.35, bevelEnabled: false }), roofMetal);
      mainRoof.position.set(0, 3.33, -3.55);
      mainRoof.castShadow = true;
      modelRoot.add(mainRoof);
      addGable(4.48, 3.31, -3.61, 0.16, 0.78);

      // Five façade bays and nine side bays.
      [-1.64, -0.82, 0, 0.82, 1.64].forEach((windowX) => {
        if (windowX !== 0) addFrontWindow(windowX, 1.43, 2.72, 0.34, 0.68);
        addFrontWindow(windowX, 2.35, 2.72, 0.32, 0.56);
        addFrontWindow(windowX, 2.28, -3.48, 0.32, 0.56);
      });
      addBox([0.56, 1.05, 0.07], [0, 1.22, 2.74], doorMaterial);
      [-2.95, -2.28, -1.61, -0.94, -0.27, 0.4, 1.07, 1.74, 2.41].forEach((windowZ) => {
        [-1, 1].forEach((side) => {
          addSideWindow(side * 2.13, 1.4, windowZ, 0.29, 0.58);
          addSideWindow(side * 2.13, 2.31, windowZ, 0.29, 0.53);
        });
      });

      // Recessed one-bay hyphens and the two-story 3-by-5-bay wings.
      [-1, 1].forEach((side) => {
        const hyphenX = side * 2.73;
        const wingX = side * 4.5;
        addBox([1.24, 1.75, 4.65], [hyphenX, 1.29, -0.55], stucco);
        addBox([1.35, 0.14, 4.78], [hyphenX, 2.18, -0.55], brightStone);
        addBox([2.3, 1.96, 4.65], [wingX, 1.4, -0.05], stucco);
        addBox([2.44, 0.16, 4.82], [wingX, 2.39, -0.05], brightStone);
        addBox([2.48, 0.08, 4.86], [wingX, 2.51, -0.05], shadowStone);

        // Low gable roofs above each legislative chamber wing.
        const wingRoofShape = new THREE.Shape();
        wingRoofShape.moveTo(-1.24, 0); wingRoofShape.lineTo(0, 0.43); wingRoofShape.lineTo(1.24, 0); wingRoofShape.closePath();
        const wingRoof = new THREE.Mesh(new THREE.ExtrudeGeometry(wingRoofShape, { depth: 4.82, bevelEnabled: false }), roofMetal);
        wingRoof.position.set(wingX, 2.52, -2.46);
        wingRoof.castShadow = true;
        modelRoot.add(wingRoof);

        // Three south bays and five exterior side bays.
        [-0.7, 0, 0.7].forEach((offsetX) => {
          if (offsetX !== 0) addFrontWindow(wingX + offsetX, 1.14, 2.29, 0.3, 0.58);
          addFrontWindow(wingX + offsetX, 1.86, 2.29, 0.28, 0.46);
        });
        addBox([0.43, 0.8, 0.065], [wingX, 1.01, 2.31], doorMaterial);
        [-1.78, -0.88, 0.02, 0.92, 1.82].forEach((windowZ) => {
          addSideWindow(wingX + side * 1.17, 1.11, windowZ, 0.3, 0.5);
          addSideWindow(wingX + side * 1.17, 1.84, windowZ, 0.3, 0.43);
        });
        [-1.45, -0.48, 0.48, 1.45].forEach((hyphenZ) => {
          addSideWindow(hyphenX + side * 0.64, 1.22, hyphenZ, 0.3, 0.53);
        });

        // Four-column wing portico and triangular pediment seen in Street View.
        const porticoCenterZ = 2.66;
        [-0.82, -0.27, 0.27, 0.82].forEach((offsetX) => addIonicColumn(wingX + offsetX, porticoCenterZ, 0.42, 1.36, 0.105));
        addBox([2.08, 0.17, 0.46], [wingX, 2.2, porticoCenterZ], brightStone);
        const wingPedimentShape = new THREE.Shape();
        wingPedimentShape.moveTo(-1.08, 0); wingPedimentShape.lineTo(0, 0.47); wingPedimentShape.lineTo(1.08, 0); wingPedimentShape.closePath();
        const wingPediment = new THREE.Mesh(new THREE.ExtrudeGeometry(wingPedimentShape, { depth: 0.42, bevelEnabled: false }), brightStone);
        wingPediment.position.set(wingX, 2.27, 2.46);
        wingPediment.castShadow = true;
        modelRoot.add(wingPediment);

        // Small south stair at each wing.
        for (let step = 0; step < 5; step += 1) {
          const depthValue = 0.9 - step * 0.12;
          addBox([2.15 - step * 0.04, 0.09, depthValue], [wingX, 0.12 + step * 0.06, 2.5 + depthValue / 2], brightStone);
        }
      });

      // The full-width, high south stair and six-column Ionic temple front.
      for (let step = 0; step < 11; step += 1) {
        const depthValue = 2.15 - step * 0.145;
        addBox([4.72 - step * 0.025, 0.09, depthValue], [0, 0.12 + step * 0.055, 3.04 + depthValue / 2], brightStone);
      }
      addBox([4.75, 0.16, 0.7], [0, 0.73, 3.18], brightStone);
      [-1.78, -1.07, -0.36, 0.36, 1.07, 1.78].forEach((columnX) => addIonicColumn(columnX, 3.72, 0.68, 2.16, 0.145));
      // Two-bay-deep return columns at the portico sides.
      [-1, 1].forEach((side) => {
        [3.05, 2.4].forEach((columnZ) => addIonicColumn(side * 1.78, columnZ, 0.68, 2.16, 0.145));
      });
      addBox([4.34, 0.22, 1.62], [0, 3.14, 3.0], brightStone);
      addBox([4.48, 0.1, 1.72], [0, 3.3, 3.0], shadowStone);
      for (let dentil = 0; dentil < 21; dentil += 1) {
        addBox([0.11, 0.09, 0.23], [-2.0 + dentil * 0.2, 3.04, 3.84], shadowStone);
      }
      const pedimentShape = new THREE.Shape();
      pedimentShape.moveTo(-2.24, 0); pedimentShape.lineTo(0, 0.82); pedimentShape.lineTo(2.24, 0); pedimentShape.closePath();
      const pediment = new THREE.Mesh(new THREE.ExtrudeGeometry(pedimentShape, { depth: 0.56, bevelEnabled: false }), brightStone);
      pediment.position.set(0, 3.28, 3.47);
      pediment.castShadow = true;
      modelRoot.add(pediment);

      // Stone cheek walls flanking the principal stair, visible from Bank Street.
      addBox([0.22, 0.56, 2.0], [-2.42, 0.39, 4.05], brightStone);
      addBox([0.22, 0.56, 2.0], [2.42, 0.39, 4.05], brightStone);

      // Analytical floor planes communicate operating intensity without
      // changing the historic exterior geometry.
      for (let floorIndex = 0; floorIndex < facility.floors; floorIndex += 1) {
        const coverageMaterial = new THREE.MeshPhysicalMaterial({ color: 0x4fcf9a, emissive: 0x0c4e3a, emissiveIntensity: 0.22, transparent: true, opacity: 0.08, roughness: 0.28 });
        addBox([10.2, 0.045, 4.55], [0, 0.83 + floorIndex * 0.76, -0.05], coverageMaterial);
        floorMaterials.push(coverageMaterial);
        floorBaseColors.push(coverageMaterial.color.clone());
      }
      // Proposed modules are confined to low-visibility wing-roof zones. The
      // satellite view alongside the model remains the visual roof reference;
      // these modules represent a planning scenario, not existing equipment.
      [-1, 1].forEach((side) => {
        for (let panelIndex = 0; panelIndex < 4; panelIndex += 1) {
          const pvModule = new THREE.Group();
          modelRoot.add(pvModule);
          pvModule.position.set(side * 4.5 + (panelIndex % 2 - 0.5) * 0.55, 2.91, -0.45 + Math.floor(panelIndex / 2) * 0.82);
          const rack = new THREE.Group();
          rack.rotation.x = -THREE.MathUtils.degToRad(10);
          rack.rotation.z = side * 0.04;
          pvModule.add(rack);
          const frame = new THREE.MeshStandardMaterial({ color: 0x9ba7aa, metalness: 0.72, roughness: 0.28 });
          addBox([0.47, 0.025, 0.75], [0, -0.018, 0], frame, rack);
          const material = new THREE.MeshStandardMaterial({ color: 0x0c5278, emissive: 0x0b7397, emissiveIntensity: 0.2, metalness: 0.68, roughness: 0.17 });
          addBox([0.42, 0.025, 0.7], [0, 0.008, 0], material, rack);
          [-0.12, 0.12].forEach((cellX) => addBox([0.012, 0.008, 0.67], [cellX, 0.026, 0], frame, rack));
          [-0.16, 0.16].forEach((supportX) => addBox([0.025, 0.12, 0.025], [supportX, -0.05, 0.24], frame, pvModule));
          panelMaterials.push(material);
          panelModules.push(pvModule);
        }
      });
    } else {
      const footprintScale = Math.min(1.48, Math.max(0.7, Math.sqrt(facility.area / facility.floors) / 185));
      const width = 5.05 * footprintScale * Math.sqrt(profile.aspect);
      const depth = 4.05 * footprintScale / Math.sqrt(profile.aspect);
      type MassPart = [number, number, number, number];
      const massParts = (floorIndex: number): MassPart[] => {
        const floorRatio = facility.floors <= 1 ? 0 : floorIndex / (facility.floors - 1);
        switch (profile.kind) {
          case "podium-tower": {
            const podiumFloors = profile.podiumFloors ?? Math.min(4, facility.floors);
            return floorIndex < podiumFloors ? [[width, depth, 0, 0]] : [[width * 0.57, depth * 0.62, width * 0.07, -depth * 0.05]];
          }
          case "tower": return [[width * (1 - floorRatio * 0.08), depth * (1 - floorRatio * 0.05), 0, 0]];
          case "stepped": {
            const tier = Math.floor(floorRatio * 3);
            return [[width * (1 - tier * 0.095), depth * (1 - tier * 0.075), 0, -tier * depth * 0.025]];
          }
          case "slab": return [[width, depth * 0.64, 0, 0]];
          case "l": return [[width, depth * 0.45, 0, depth * 0.26], [width * 0.36, depth * 0.66, -width * 0.32, -depth * 0.13]];
          case "u": {
            const washingtonTaper = facility.id === "DGS-702"
              ? floorIndex < 2 ? 1.035 : floorIndex === facility.floors - 1 ? 0.965 : 1 - floorRatio * 0.012
              : 1;
            return [
              [width * washingtonTaper, depth * 0.32 * washingtonTaper, 0, -depth * 0.34],
              [width * 0.24 * washingtonTaper, depth * 0.72 * washingtonTaper, -width * 0.38 * washingtonTaper, depth * 0.12],
              [width * 0.24 * washingtonTaper, depth * 0.72 * washingtonTaper, width * 0.38 * washingtonTaper, depth * 0.12],
            ];
          }
          case "courtyard": return [[width, depth * 0.27, 0, -depth * 0.37], [width, depth * 0.27, 0, depth * 0.37], [width * 0.25, depth * 0.48, -width * 0.375, 0], [width * 0.25, depth * 0.48, width * 0.375, 0]];
          case "cross": return [[width * 0.42, depth, 0, 0], [width, depth * 0.42, 0, 0]];
          case "row": return [[width * 0.62, depth, 0, 0]];
          case "mansion": return [[width * 0.5, depth * 0.78, 0, 0], [width * 0.25, depth * 0.55, -width * 0.375, -depth * 0.04], [width * 0.25, depth * 0.55, width * 0.375, -depth * 0.04]];
          case "pavilion": return [[width * 0.58, depth * 0.78, 0, 0], [width * 0.21, depth * 0.58, -width * 0.395, -depth * 0.03], [width * 0.21, depth * 0.58, width * 0.395, -depth * 0.03]];
          case "laboratory": return [[width, depth * 0.44, 0, -depth * 0.27], [width * 0.42, depth * 0.52, -width * 0.27, depth * 0.22], [width * 0.42, depth * 0.52, width * 0.27, depth * 0.22]];
          case "monument": return [[width * 0.52, depth * 0.72, 0, 0]];
          case "warehouse": return [[width, depth, 0, 0]];
          default: return [[width, depth, 0, 0]];
        }
      };
      const facadeTrimMaterial = new THREE.MeshStandardMaterial({ color: facility.id === "DGS-702" ? 0xd8c8aa : 0xbec6c4, roughness: 0.58, metalness: 0.08 });
      const facadeShadowMaterial = new THREE.MeshStandardMaterial({ color: 0x17272d, roughness: 0.66, metalness: 0.18 });
      const plinthMaterial = new THREE.MeshStandardMaterial({ color: facility.id === "DGS-702" ? 0x9f8f75 : 0x748086, roughness: 0.82 });

      for (let index = 0; index < facility.floors; index += 1) {
        const isWashington = facility.id === "DGS-702";
        const washingtonColor = index < 2 ? 0xd5cbb8 : index === facility.floors - 1 ? 0xcdbf9f : 0xb99a72;
        const material = new THREE.MeshPhysicalMaterial({ color: isWashington ? washingtonColor : profile.wall, emissive: 0x082a26, emissiveIntensity: 0.12,
          roughness: profile.kind === "tower" || profile.kind === "podium-tower" ? 0.36 : 0.56, metalness: 0.08, clearcoat: 0.18 });
        floorMaterials.push(material);
        floorBaseColors.push(material.color.clone());
        const slabMaterial = new THREE.MeshStandardMaterial({ color: 0xb8cad3, metalness: 0.4, roughness: 0.42 });
        const windowMaterial = new THREE.MeshStandardMaterial({ color: profile.glass, emissive: 0x0d3d46, emissiveIntensity: 0.2, metalness: 0.24, roughness: 0.2 });
        windowMaterials.push(windowMaterial);
        massParts(index).forEach(([partWidth, partDepth, partX, partZ]) => {
          const floorY = 0.42 + index * floorPitch;
          if (isWashington) {
            addRoundedBox([partWidth, floorPitch * 0.78, partDepth], [partX, floorY, partZ], material, 0.16);
            addRoundedBox([partWidth + 0.1, 0.055, partDepth + 0.1], [partX, 0.12 + index * floorPitch, partZ], slabMaterial, 0.12);
            if (index === 1 || index === facility.floors - 1) {
              addRoundedBox([partWidth + 0.16, 0.075, partDepth + 0.16], [partX, floorY + floorPitch * 0.43, partZ], slabMaterial, 0.13);
            }
          } else {
            addBox([partWidth, floorPitch * 0.78, partDepth], [partX, floorY, partZ], material);
            addBox([partWidth + 0.1, 0.055, partDepth + 0.1], [partX, 0.12 + index * floorPitch, partZ], slabMaterial);
          }
          const windowHeight = Math.max(0.08, floorPitch * (profile.kind === "warehouse" ? 0.2 : 0.31));
          if (profile.facade === "punched") {
            const frontBays = Math.max(2, Math.min(10, Math.round(partWidth / 0.65)));
            const sideBays = Math.max(2, Math.min(8, Math.round(partDepth / 0.72)));
            const frontWindowWidth = Math.min(0.34, partWidth * 0.58 / frontBays);
            const sideWindowWidth = Math.min(0.32, partDepth * 0.56 / sideBays);
            for (let bay = 0; bay < frontBays; bay += 1) {
              const windowX = partX - partWidth * 0.36 + bay * (partWidth * 0.72 / Math.max(frontBays - 1, 1));
              addBox([frontWindowWidth, windowHeight * 1.28, 0.045], [windowX, floorY, partZ + partDepth / 2 + 0.024], windowMaterial);
              addBox([frontWindowWidth, windowHeight * 1.28, 0.045], [windowX, floorY, partZ - partDepth / 2 - 0.024], windowMaterial);
              [-1, 1].forEach((side) => {
                const frameZ = partZ + side * (partDepth / 2 + 0.052);
                [-1, 1].forEach((vertical) => addBox([frontWindowWidth + 0.055, 0.028, 0.06], [windowX, floorY + vertical * windowHeight * 0.68, frameZ], facadeTrimMaterial));
              });
            }
            for (let bay = 0; bay < sideBays; bay += 1) {
              const windowZ = partZ - partDepth * 0.34 + bay * (partDepth * 0.68 / Math.max(sideBays - 1, 1));
              addBox([0.045, windowHeight * 1.28, sideWindowWidth], [partX + partWidth / 2 + 0.024, floorY, windowZ], windowMaterial);
              addBox([0.045, windowHeight * 1.28, sideWindowWidth], [partX - partWidth / 2 - 0.024, floorY, windowZ], windowMaterial);
              [-1, 1].forEach((side) => {
                const frameX = partX + side * (partWidth / 2 + 0.052);
                [-1, 1].forEach((vertical) => addBox([0.06, 0.028, sideWindowWidth + 0.055], [frameX, floorY + vertical * windowHeight * 0.68, windowZ], facadeTrimMaterial));
              });
            }
          } else if (profile.facade === "industrial") {
            addBox([partWidth * 0.54, windowHeight, 0.045], [partX, floorY, partZ + partDepth / 2 + 0.024], windowMaterial);
            addBox([partWidth * 0.56, 0.04, 0.07], [partX, floorY - windowHeight * 0.6, partZ + partDepth / 2 + 0.052], facadeTrimMaterial);
          } else {
            addBox([partWidth * 0.68, windowHeight, 0.045], [partX, floorY, partZ + partDepth / 2 + 0.024], windowMaterial);
            addBox([partWidth * 0.68, windowHeight, 0.045], [partX, floorY, partZ - partDepth / 2 - 0.024], windowMaterial);
            addBox([0.045, windowHeight, partDepth * 0.64], [partX + partWidth / 2 + 0.024, floorY, partZ], windowMaterial);
            addBox([0.045, windowHeight, partDepth * 0.64], [partX - partWidth / 2 - 0.024, floorY, partZ], windowMaterial);
            const frontMullions = Math.max(3, Math.min(9, Math.round(partWidth / 0.7)));
            for (let mullion = 1; mullion < frontMullions; mullion += 1) {
              const mullionX = partX - partWidth * 0.34 + mullion * (partWidth * 0.68 / frontMullions);
              addBox([0.025, windowHeight * 1.08, 0.06], [mullionX, floorY, partZ + partDepth / 2 + 0.052], facadeShadowMaterial);
              addBox([0.025, windowHeight * 1.08, 0.06], [mullionX, floorY, partZ - partDepth / 2 - 0.052], facadeShadowMaterial);
            }
            const sideMullions = Math.max(3, Math.min(7, Math.round(partDepth / 0.75)));
            for (let mullion = 1; mullion < sideMullions; mullion += 1) {
              const mullionZ = partZ - partDepth * 0.32 + mullion * (partDepth * 0.64 / sideMullions);
              addBox([0.06, windowHeight * 1.08, 0.025], [partX + partWidth / 2 + 0.052, floorY, mullionZ], facadeShadowMaterial);
              addBox([0.06, windowHeight * 1.08, 0.025], [partX - partWidth / 2 - 0.052, floorY, mullionZ], facadeShadowMaterial);
            }
          }
        });
      }
      const roofY = 0.42 + facility.floors * floorPitch;
      const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8f9998, roughness: 0.62, metalness: 0.12 });
      const topParts = massParts(Math.max(0, facility.floors - 1));
      massParts(0).forEach(([partWidth, partDepth, partX, partZ]) => {
        addBox([partWidth + 0.14, 0.16, partDepth + 0.14], [partX, 0.15, partZ], plinthMaterial);
      });
      topParts.forEach(([partWidth, partDepth, partX, partZ]) => {
        if (facility.id === "DGS-702") addRoundedBox([partWidth + 0.12, 0.12, partDepth + 0.12], [partX, roofY, partZ], roofMaterial, 0.14);
        else addBox([partWidth + 0.12, 0.12, partDepth + 0.12], [partX, roofY, partZ], roofMaterial);
        if (profile.facade !== "industrial") addBox([partWidth + 0.18, 0.07, partDepth + 0.18], [partX, roofY - 0.08, partZ], facadeTrimMaterial);
      });

      const [roofWidth, roofDepth, roofX, roofZ] = topParts[0];
      tourCenterX = roofX;
      tourCenterZ = roofZ;
      tourWidth = roofWidth * 0.96;
      tourDepth = roofDepth * 0.94;
      tourRoofY = roofY + 0.1;
      if (["gable", "hip"].includes(profile.roof)) {
        tourCenterX = roofX + roofWidth * 0.28;
        tourWidth = roofWidth * 0.32;
        tourRoofY = roofY + 0.3;
      } else if (profile.roof === "mansard") {
        tourWidth = roofWidth * 0.5;
        tourDepth = roofDepth * 0.58;
        tourRoofY = roofY + 0.56;
      } else if (profile.roof === "crown") {
        tourWidth = roofWidth * 0.54;
        tourDepth = roofDepth * 0.48;
        tourRoofY = roofY + 0.43;
      } else if (profile.roof === "cupola" || profile.clockTower) {
        tourCenterX = roofX + roofWidth * 0.27;
        tourWidth = roofWidth * 0.28;
        tourDepth = roofDepth * 0.54;
        tourRoofY = roofY + 0.11;
      } else if (profile.roof === "sawtooth") {
        tourWidth = roofWidth * 0.62;
        tourDepth = roofDepth * 0.54;
        tourRoofY = roofY + 0.41;
      }
      if (facility.id === "DGS-702") {
        // The current aerial roof reads as three broad, connected low-slope
        // zones with no raised central rooftop block. At 100%, the three fields
        // extend almost edge-to-edge so the full usable surface reads as covered.
        tourCenterX = 0;
        tourCenterZ = depth * 0.02;
        tourWidth = width * 0.9;
        tourDepth = depth * 0.86;
        tourRoofY = roofY + 0.1;
        customRoofFields = topParts.map(([partWidth, partDepth, partX, partZ]) => ({
          x: partX,
          z: partZ,
          width: partWidth * 0.98,
          depth: partDepth * 0.96,
          y: roofY + 0.18,
        }));
      } else if (profile.roof === "flat" && topParts.length > 1) {
        // Complex flat roofs use every top-floor mass instead of placing the
        // entire array on only the first wing.
        customRoofFields = topParts.map(([partWidth, partDepth, partX, partZ]) => ({
          x: partX,
          z: partZ,
          width: partWidth * 0.96,
          depth: partDepth * 0.94,
          y: roofY + 0.18,
        }));
        const fieldMinX = Math.min(...customRoofFields.map((field) => field.x - field.width / 2));
        const fieldMaxX = Math.max(...customRoofFields.map((field) => field.x + field.width / 2));
        const fieldMinZ = Math.min(...customRoofFields.map((field) => field.z - field.depth / 2));
        const fieldMaxZ = Math.max(...customRoofFields.map((field) => field.z + field.depth / 2));
        tourCenterX = (fieldMinX + fieldMaxX) / 2;
        tourCenterZ = (fieldMinZ + fieldMaxZ) / 2;
        tourWidth = fieldMaxX - fieldMinX;
        tourDepth = fieldMaxZ - fieldMinZ;
        tourRoofY = roofY + 0.1;
      }
      if (["gable", "hip", "mansard"].includes(profile.roof)) {
        topParts.forEach(([partWidth, partDepth, partX, partZ]) => {
          const roofShape = new THREE.Shape();
          if (profile.roof === "mansard") {
            roofShape.moveTo(-partWidth / 2, 0); roofShape.lineTo(-partWidth * 0.32, 0.48); roofShape.lineTo(partWidth * 0.32, 0.48); roofShape.lineTo(partWidth / 2, 0); roofShape.closePath();
          } else {
            roofShape.moveTo(-partWidth / 2, 0); roofShape.lineTo(0, profile.roof === "hip" ? 0.42 : 0.52); roofShape.lineTo(partWidth / 2, 0); roofShape.closePath();
          }
          const roofMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(roofShape, { depth: partDepth, bevelEnabled: false }), roofMaterial);
          roofMesh.position.set(partX, roofY + 0.05, partZ - partDepth / 2);
          roofMesh.castShadow = true;
          modelRoot.add(roofMesh);
        });
      } else if (profile.roof === "sawtooth") {
        for (let tooth = 0; tooth < 5; tooth += 1) {
          const toothShape = new THREE.Shape();
          const toothWidth = roofWidth / 5;
          toothShape.moveTo(-toothWidth / 2, 0); toothShape.lineTo(toothWidth * 0.35, 0.35); toothShape.lineTo(toothWidth / 2, 0); toothShape.closePath();
          const toothRoof = new THREE.Mesh(new THREE.ExtrudeGeometry(toothShape, { depth: roofDepth, bevelEnabled: false }), roofMaterial);
          toothRoof.position.set(roofX - roofWidth / 2 + toothWidth / 2 + tooth * toothWidth, roofY + 0.04, roofZ - roofDepth / 2);
          modelRoot.add(toothRoof);
        }
      } else if (profile.roof === "crown") {
        addBox([roofWidth * 0.7, 0.38, roofDepth * 0.68], [roofX, roofY + 0.22, roofZ], roofMaterial);
      } else if (profile.roof === "cupola") {
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(roofWidth * 0.17, roofWidth * 0.22, 0.48, 20), roofMaterial);
        drum.position.set(roofX, roofY + 0.28, roofZ);
        modelRoot.add(drum);
        const cap = new THREE.Mesh(new THREE.ConeGeometry(roofWidth * 0.24, 0.5, 20), roofMaterial);
        cap.position.set(roofX, roofY + 0.72, roofZ);
        modelRoot.add(cap);
      }

      if (profile.roof === "flat" && !profile.balustrade && facility.id !== "DGS-702") {
        const parapetMaterial = new THREE.MeshStandardMaterial({ color: 0xaab2af, roughness: 0.76, metalness: 0.08 });
        topParts.forEach(([partWidth, partDepth, partX, partZ]) => {
          const parapetY = roofY + 0.15;
          addBox([partWidth + 0.14, 0.16, 0.055], [partX, parapetY, partZ - partDepth / 2 - 0.04], parapetMaterial);
          addBox([partWidth + 0.14, 0.16, 0.055], [partX, parapetY, partZ + partDepth / 2 + 0.04], parapetMaterial);
          addBox([0.055, 0.16, partDepth + 0.14], [partX - partWidth / 2 - 0.04, parapetY, partZ], parapetMaterial);
          addBox([0.055, 0.16, partDepth + 0.14], [partX + partWidth / 2 + 0.04, parapetY, partZ], parapetMaterial);
        });
      }

      if (profile.balustrade) {
        const stone = new THREE.MeshStandardMaterial({ color: 0xe8e2d5, roughness: 0.68 });
        for (let post = 0; post < 11; post += 1) {
          const postX = -width * 0.42 + post * width * 0.084;
          addBox([0.075, 0.34, 0.075], [postX, roofY + 0.21, depth * 0.38], stone);
        }
        addBox([width * 0.92, 0.07, 0.1], [0, roofY + 0.39, depth * 0.38], stone);
      }
      if (profile.clockTower) {
        const towerStone = new THREE.MeshPhysicalMaterial({ color: 0x88765f, roughness: 0.7, clearcoat: 0.08 });
        const clockFace = new THREE.MeshStandardMaterial({ color: 0xe6dfc9, emissive: 0x6b5e45, emissiveIntensity: 0.12, roughness: 0.5 });
        const towerX = -width * 0.36;
        const towerZ = depth * 0.34;
        addBox([width * 0.2, 1.95, depth * 0.2], [towerX, roofY + 0.88, towerZ], towerStone);
        const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.055, 32), clockFace);
        clock.rotation.x = Math.PI / 2;
        clock.position.set(towerX, roofY + 1.25, towerZ + depth * 0.105);
        modelRoot.add(clock);
        const towerCap = new THREE.Mesh(new THREE.ConeGeometry(width * 0.15, 0.72, 4), roofMaterial);
        towerCap.position.set(towerX, roofY + 2.2, towerZ);
        towerCap.rotation.y = Math.PI / 4;
        modelRoot.add(towerCap);
      }
      if (profile.verticalFins) {
        const finMaterial = new THREE.MeshStandardMaterial({ color: 0xc7cecc, metalness: 0.24, roughness: 0.46 });
        for (let fin = 0; fin < 7; fin += 1) {
          const finX = -width * 0.22 + fin * width * 0.073;
          addBox([0.055, buildingHeight * 0.72, 0.14], [finX, buildingHeight * 0.64, depth * 0.325], finMaterial);
        }
      }
      if (profile.groundColonnade) {
        const columnMaterial = new THREE.MeshStandardMaterial({ color: 0xd2cec4, roughness: 0.62 });
        for (let columnIndex = 0; columnIndex < 8; columnIndex += 1) {
          const columnX = -width * 0.4 + columnIndex * width * 0.8 / 7;
          const column = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, Math.min(0.8, floorPitch * 1.5), 16), columnMaterial);
          column.position.set(columnX, 0.42, depth * 0.34);
          column.castShadow = true;
          modelRoot.add(column);
        }
      }

      if (profile.portico) {
        const porticoZ = depth * 0.46;
        [-0.72, -0.24, 0.24, 0.72].forEach((position) => {
          const column = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, Math.min(1.4, buildingHeight * 0.78), 20), new THREE.MeshStandardMaterial({ color: 0xeee9dc, roughness: 0.58 }));
          column.position.set(position * width * 0.36, 0.28 + Math.min(1.4, buildingHeight * 0.78) / 2, porticoZ);
          column.castShadow = true;
          modelRoot.add(column);
        });
        addBox([width * 0.62, 0.16, 0.48], [0, Math.min(1.65, buildingHeight * 0.82), porticoZ], new THREE.MeshStandardMaterial({ color: 0xeee9dc, roughness: 0.58 }));
      }

      // Individual modules make the 25/50/75/100% scenario legible. At 100%
      // the active fields fill the complete usable roof geometry.
      const pitched = ["gable", "hip"].includes(profile.roof);
      const pitchRise = profile.roof === "hip" ? 0.42 : 0.52;
      const pitchAngle = pitched ? -Math.atan2(pitchRise, roofWidth / 2) : 0;
      const rackTilt = THREE.MathUtils.degToRad(facility.id === "DGS-702" ? 11 : 12);
      const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xa8b3b5, metalness: 0.72, roughness: 0.28 });
      const addPvModule = (panelX: number, panelZ: number, roofSurfaceY: number, panelWidth: number, panelDepth: number, modulePitch: number, useSupports: boolean) => {
          const pvModule = new THREE.Group();
          modelRoot.add(pvModule);
          pvModule.position.set(panelX, roofSurfaceY + 0.06, panelZ);
          const rack = new THREE.Group();
          rack.rotation.z = modulePitch;
          if (useSupports) rack.rotation.x = -rackTilt;
          pvModule.add(rack);
          addBox([panelWidth + 0.04, 0.025, panelDepth + 0.04], [0, -0.018, 0], frameMaterial, rack);
          const material = new THREE.MeshPhysicalMaterial({ color: 0x0b5278, emissive: 0x0b7397, emissiveIntensity: 0.2, metalness: 0.62, roughness: 0.14, clearcoat: 0.92, clearcoatRoughness: 0.08 });
          addBox([panelWidth, 0.026, panelDepth], [0, 0.008, 0], material, rack);
          [-0.22, 0.22].forEach((cell) => addBox([0.01, 0.009, panelDepth * 0.94], [cell * panelWidth, 0.026, 0], frameMaterial, rack));
          [-0.36, -0.12, 0.12, 0.36].forEach((cell) => addBox([panelWidth * 0.94, 0.009, 0.01], [0, 0.026, cell * panelDepth], frameMaterial, rack));
          if (useSupports) {
            [-0.34, 0.34].forEach((supportX) => addBox([0.022, 0.12, 0.022], [supportX * panelWidth, -0.05, panelDepth * 0.32], frameMaterial, pvModule));
          }
          panelMaterials.push(material);
          panelModules.push(pvModule);
      };
      const activeRoofFields = customRoofFields.length
        ? customRoofFields
        : [{ x: tourCenterX, z: tourCenterZ, width: tourWidth, depth: tourDepth, y: tourRoofY }];
      const fieldLayouts = activeRoofFields.map((arrayField, fieldIndex) => {
        const isWashington = facility.id === "DGS-702";
        const isSingleField = activeRoofFields.length === 1;
        const landscape = arrayField.width >= arrayField.depth;
        const pvColumns = isWashington ? (fieldIndex === 0 ? 5 : 2) : isSingleField ? 4 : landscape ? 4 : 3;
        const pvRows = isWashington ? (fieldIndex === 0 ? 2 : 5) : isSingleField ? 4 : landscape ? 3 : 4;
        const arrayWidth = arrayField.width * 0.995;
        const arrayDepth = arrayField.depth * 0.99;
        const panelWidth = Math.max(0.14, arrayWidth / pvColumns * 0.98);
        const panelDepth = Math.max(0.2, arrayDepth / pvRows * 0.98);
        return Array.from({ length: pvRows * pvColumns }, (_, slot) => {
          const row = Math.floor(slot / pvColumns);
          const column = slot % pvColumns;
          const panelX = arrayField.x - arrayWidth * 0.5 + arrayWidth * (column + 0.5) / pvColumns;
          const panelZ = arrayField.z - arrayDepth * 0.5 + arrayDepth * (row + 0.5) / pvRows;
          const roofSurfaceY = pitched
            ? roofY + 0.07 + pitchRise * Math.max(0, 1 - Math.abs(panelX - roofX) / (roofWidth / 2))
            : arrayField.y;
          return { x: panelX, z: panelZ, y: roofSurfaceY, width: panelWidth, depth: panelDepth };
        });
      });
      const longestField = Math.max(...fieldLayouts.map((layout) => layout.length));
      for (let slot = 0; slot < longestField; slot += 1) {
        fieldLayouts.forEach((layout) => {
          const panel = layout[slot];
          if (panel) addPvModule(panel.x, panel.z, panel.y, panel.width, panel.depth, pitchAngle, !pitched);
        });
      }
    }

    // A restrained setback outline appears only in the rooftop view. It is a
    // planning overlay, not a permanent part of the building fabric.
    const roofGuideGroup = new THREE.Group();
    modelRoot.add(roofGuideGroup);
    const guideMaterial = new THREE.MeshStandardMaterial({ color: 0xe8bd62, emissive: 0x8b641d, emissiveIntensity: 0.22, transparent: true, opacity: 0.72, roughness: 0.5 });
    const guideFields = customRoofFields.length
      ? customRoofFields
      : [{ x: tourCenterX, z: tourCenterZ, width: tourWidth, depth: tourDepth, y: tourRoofY + 0.075 }];
    guideFields.forEach((field) => {
      addBox([field.width, 0.018, 0.035], [field.x, field.y, field.z - field.depth / 2], guideMaterial, roofGuideGroup);
      addBox([field.width, 0.018, 0.035], [field.x, field.y, field.z + field.depth / 2], guideMaterial, roofGuideGroup);
      addBox([0.035, 0.018, field.depth], [field.x - field.width / 2, field.y, field.z], guideMaterial, roofGuideGroup);
      addBox([0.035, 0.018, field.depth], [field.x + field.width / 2, field.y, field.z], guideMaterial, roofGuideGroup);
    });
    roofGuideGroup.visible = false;

    const modelBounds = new THREE.Box3().setFromObject(modelRoot);
    const modelSphere = modelBounds.getBoundingSphere(new THREE.Sphere());
    const exteriorTarget = modelSphere.center.clone();
    exteriorTarget.y = Math.max(0.8, modelBounds.min.y + (modelBounds.max.y - modelBounds.min.y) * 0.46);
    const exteriorDistance = isCapitol ? 18.8 : Math.max(12.5, Math.min(30, modelSphere.radius * 2.45));
    const exteriorCameraPosition = new THREE.Vector3(
      exteriorTarget.x + exteriorDistance * 0.58,
      exteriorTarget.y + exteriorDistance * 0.38,
      exteriorTarget.z + exteriorDistance * 0.72,
    );
    camera.position.copy(exteriorCameraPosition);
    controls.target.copy(exteriorTarget);
    controls.maxDistance = exteriorDistance * 1.7;

    const resize = () => {
      const widthValue = Math.max(1, mount.clientWidth);
      const heightValue = Math.max(1, mount.clientHeight);
      camera.aspect = widthValue / heightValue;
      camera.updateProjectionMatrix();
      renderer.setSize(widthValue, heightValue, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    let animationId = 0;
    let previousViewMode: TwinViewMode = "exterior";
    const animate = () => {
      const energy = energyAt(facility, hourRef.current, coverageRef.current, dayRef.current);
      const solarPhase = Math.PI * ((hourRef.current - 6) / 12);
      const daylight = Math.max(0, Math.sin(solarPhase));
      const seasonalLift = 0.82 + 0.18 * Math.sin((dayRef.current - 80) / 365 * Math.PI * 2);
      sun.position.set(
        Math.cos(solarPhase) * 14,
        1.6 + daylight * 13.5 * seasonalLift,
        Math.sin(solarPhase) * 10,
      );
      sun.intensity = 0.35 + daylight * 3.1;
      skyLight.intensity = 0.72 + daylight * 1.38;
      accent.intensity = 5 + daylight * 11;
      const loadIntensity = Math.min(energy.load / facility.peakLoad, 1);
      floorMaterials.forEach((material, index) => {
        material.color.copy(floorBaseColors[index] ?? new THREE.Color(0x8aa0a8));
        material.emissive.set(0x071b20);
        material.emissiveIntensity = 0.08 + loadIntensity * 0.16;
        if (material.transparent) material.opacity = 0.045 + loadIntensity * 0.035;
      });
      windowMaterials.forEach((material) => {
        material.emissiveIntensity = 0.14 + loadIntensity * 0.5;
      });
      const activePanelCount = Math.ceil(panelMaterials.length * coverageRef.current / 100);
      panelMaterials.forEach((material, index) => {
        const active = index < activePanelCount;
        material.color.set(active ? 0x0b5278 : 0x33434a);
        material.emissiveIntensity = active ? 0.06 + pvProfile[hourRef.current] * 0.42 : 0;
      });
      panelModules.forEach((pvModule, index) => { pvModule.visible = index < activePanelCount; });
      const mode = viewModeRef.current;
      modelRoot.visible = true;
      ground.visible = true;
      roofGuideGroup.visible = mode === "rooftop";
      controls.autoRotate = mode === "exterior";
      controls.minDistance = mode === "exterior" ? Math.max(5.5, exteriorDistance * 0.42) : 2.2;
      controls.maxDistance = mode === "exterior" ? exteriorDistance * 1.7 : 18;
      if (mode !== previousViewMode) {
        if (mode === "exterior") {
          camera.position.copy(exteriorCameraPosition);
          controls.target.copy(exteriorTarget);
        } else {
          const overviewHeight = Math.max(4.5, Math.max(tourWidth, tourDepth) * 1.25);
          camera.position.set(tourCenterX + tourWidth * 0.45, tourRoofY + overviewHeight, tourCenterZ + tourDepth * 0.62);
          controls.target.set(tourCenterX, tourRoofY, tourCenterZ);
        }
        previousViewMode = mode;
      }
      controls.update();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();
    cleanup = () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      controls.dispose();
      environmentTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
    };
    };

    initializeModel().catch(() => {
      if (!disposed) setFallback(true);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [facility]);

  const fallbackPanelCount = facility.id === "DGS-702" ? 30 : 16;
  const fallbackActivePanels = Math.ceil(fallbackPanelCount * coverage / 100);
  const fallbackWallColor = `#${selectedProfile.wall.toString(16).padStart(6, "0")}`;
  const annualLoadKwh = annualElectricityKwh(facility);
  const demandOffset = annualLoadKwh ? impact.annualOffsetKwh / annualLoadKwh * 100 : 0;
  const pvYield = impact.activePvCapacity ? impact.annualPvKwh / impact.activePvCapacity : 0;
  const viewLabel = viewMode === "exterior" ? "Source-referenced exterior" : "Satellite-referenced rooftop + proposed PV";
  return <div className="facility-model" ref={mountRef} aria-label={`Interactive source-referenced 3D model of ${facility.name}`}>
    {fallback && viewMode !== "exterior" && <div className={`rooftop-fallback rooftop-${viewMode}`} role="img" aria-label={viewLabel}>
      <div className="fallback-roof">
        <span>ROOFTOP PV</span>
        <div className="fallback-pv-field">{Array.from({ length: fallbackPanelCount }, (_, index) => <i key={index} className={index < fallbackActivePanels ? "is-active" : ""} />)}</div>
        <strong>{viewLabel}</strong>
      </div>
    </div>}
    {fallback && viewMode === "exterior" && <div className="model-fallback" role="img" aria-label={`Building-specific ${facility.floors}-story reconstruction with ${coverage}% of technically usable roof developed for PV`}>
      {facility.id === "DGS-738" ? <div className="capitol-fallback-scene">
        <div className="capitol-css-building">
          <div className="capitol-hyphen hyphen-left" />
          <div className="capitol-wing wing-left"><span /><span /><span /><span /><span /><span /></div>
          <div className="capitol-temple"><div className="capitol-pediment" /><div className="capitol-columns">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div><b /></div>
          <div className="capitol-wing wing-right"><span /><span /><span /><span /><span /><span /></div>
          <div className="capitol-hyphen hyphen-right" />
          <div className="capitol-steps">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div>
        </div>
      </div> : <div className={`mini-building profile-${selectedProfile.kind}`} style={{ height: `${Math.min(245, 92 + facility.floors * 5)}px` }}>
          {Array.from({ length: facility.floors }, (_, index) => <i key={index} style={{ background: `linear-gradient(90deg,${fallbackWallColor},#667981)` }} />)}
          <div className="mini-roof">{Array.from({ length: fallbackPanelCount }, (_, index) => <span key={index} className={index < fallbackActivePanels ? "is-active" : ""} />)}</div>
        </div>}
    </div>}
    <span className="model-hint">Drag to look around · scroll to move</span>
    <span className="model-architecture">{facility.id === "DGS-738" ? "Satellite + HABS source model" : `Source-referenced 3D · ${selectedProfile.label}`}</span>
    <div className="model-tour" role="group" aria-label="Explore the rooftop digital twin">
      <button type="button" className={viewMode === "exterior" ? "is-active" : ""} aria-pressed={viewMode === "exterior"} onClick={() => selectView("exterior")}>Exterior</button>
      <button type="button" className={viewMode === "rooftop" ? "is-active" : ""} aria-pressed={viewMode === "rooftop"} onClick={() => selectView("rooftop")}>Rooftop</button>
    </div>
    <div className="model-view-status" aria-live="polite"><span />{viewLabel}</div>
    <div className="model-data-overlay" aria-label="Major facility data shown in the 3D view">
      <div className="model-data-head"><span>FACILITY ENERGY TWIN</span><strong>{formatDay(dayOfYear)} · {formatHour(hour)}</strong></div>
      <div className="model-data-grid">
        <div><span>Demand</span><strong>{energy.load} <small>kW</small></strong></div>
        <div><span>PV now</span><strong>{energy.pv} <small>kW</small></strong></div>
        <div><span>{energy.grid >= 0 ? "Grid import" : "Grid export"}</span><strong>{Math.abs(energy.grid)} <small>kW</small></strong></div>
        <div><span>PV capacity</span><strong>{compactNumber(impact.activePvCapacity)} <small>kW</small></strong></div>
        <div><span>Annual PV</span><strong>{compactNumber(impact.annualPvKwh / 1000)} <small>MWh</small></strong></div>
        <div><span>Demand offset</span><strong>{demandOffset.toFixed(1)}<small>% /yr</small></strong></div>
        <div><span>CO₂e avoided</span><strong>{compactNumber(impact.avoidedTons)} <small>t/yr</small></strong></div>
        <div><span>Cost avoided</span><strong>{compactCurrency(impact.avoidedCost)} <small>/yr</small></strong></div>
        <div><span>PV yield</span><strong>{compactNumber(pvYield)} <small>kWh/kW</small></strong></div>
      </div>
      <p>{coverage}% of usable roof · {formatNumber(Math.round(impact.selectedRoofArea))} sq. ft. · {facility.id === "DGS-702" ? "balanced three-zone array" : "sloped planning array"}</p>
    </div>
  </div>;
}

type MapMode = "capitol" | "all";

const CAPITOL_POSITION: [number, number] = [37.5384975, -77.4353229];

function PortfolioMap({ visible, selected, hour, coverage, dayOfYear, mode, onSelect }: { visible: Facility[]; selected: Facility; hour: number; coverage: number; dayOfYear: number; mode: MapMode; onSelect: (facility: Facility) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const previousSelectionRef = useRef<string | null>(null);
  const previousModeRef = useRef<MapMode | null>(null);
  const previousVisibleKeyRef = useRef("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;

    import("leaflet").then((L) => {
      if (disposed || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(container, {
        center: CAPITOL_POSITION,
        zoom: 17.25,
        zoomSnap: 0.25,
        zoomControl: true,
        attributionControl: true,
        minZoom: 9,
        maxZoom: 19,
      });
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
        attribution: 'Powered by <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a> · Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      }).addTo(map);
      markerLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
      window.setTimeout(() => map.invalidateSize(), 0);
    }).catch(() => setReady(false));

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!ready || !L || !map || !layer) return;

    layer.clearLayers();
    visible.forEach((facility) => {
      const isSelected = selected.id === facility.id;
      const isCapitol = facility.id === "DGS-738";
      const energyClass = performanceClass(facility, hour, coverage, dayOfYear);
      const marker = L.marker([facility.lat, facility.lon], {
        keyboard: true,
        riseOnHover: true,
        title: `${facility.name} — ${facility.address}`,
        alt: `${facility.name}, ${facility.address}, ${facility.floors} ${facility.floors === 1 ? "floor" : "floors"}`,
        icon: L.divIcon({
          className: "facility-map-icon",
          html: `<span class="satellite-marker ${energyClass} ${isSelected ? "is-selected" : ""} ${isCapitol ? "is-capitol" : ""}"><i></i><b>${facility.floors}F</b></span>`,
          iconSize: [36, 44],
          iconAnchor: [18, 40],
          tooltipAnchor: [0, -38],
        }),
      }).addTo(layer);
      marker.bindTooltip(`<strong>${facility.name}</strong><span>${facility.address} · ${facility.floors} ${facility.floors === 1 ? "floor" : "floors"}</span>`, {
        className: "facility-tooltip",
        direction: "top",
        offset: [0, -2],
        opacity: 0.98,
        permanent: isCapitol || isSelected,
      });
      marker.on("click", () => onSelect(facility));
      marker.getElement()?.setAttribute("aria-label", `${facility.name}, ${facility.address}, ${facility.floors} documented ${facility.floors === 1 ? "floor" : "floors"}`);
      if (isSelected) marker.openTooltip();
    });

    const visibleKey = visible.map((facility) => facility.id).join("|");
    const firstView = previousModeRef.current === null;
    const selectionChanged = previousSelectionRef.current !== null && previousSelectionRef.current !== selected.id;
    const modeChanged = previousModeRef.current !== null && previousModeRef.current !== mode;
    const visibleChanged = previousVisibleKeyRef.current !== visibleKey;
    previousSelectionRef.current = selected.id;
    previousModeRef.current = mode;
    previousVisibleKeyRef.current = visibleKey;
    if (selectionChanged) {
      map.flyTo([selected.lat, selected.lon], 17.25, { duration: 0.75 });
    } else if ((firstView || modeChanged) && mode === "capitol") {
      map.flyTo(CAPITOL_POSITION, 17.25, { duration: 0.7 });
    } else if ((firstView || modeChanged || visibleChanged) && visible.length) {
      map.fitBounds(L.latLngBounds(visible.map((facility) => [facility.lat, facility.lon] as [number, number])), { padding: [42, 42], maxZoom: 13, animate: true });
    }
  }, [visible, selected, hour, coverage, dayOfYear, mode, onSelect, ready]);

  return <div className="map-wrap satellite-wrap">
    <div ref={containerRef} className="leaflet-map" role="application" aria-label={`Interactive satellite map of ${visible.length} real DGS-managed facility locations`} />
    {!ready && <div className="map-loading">Loading satellite imagery…</div>}
    <div className="satellite-status"><span className="live-pulse" />Actual satellite imagery</div>
    <div className="map-legend" aria-hidden="true">
      <span><i className="legend-swatch high" />High solar coverage</span>
      <span><i className="legend-swatch medium" />Moderate</span>
      <span><i className="legend-swatch low" />Grid-led</span>
    </div>
  </div>;
}

export default function Home() {
  const [hour, setHour] = useState(12);
  const [dayOfYear, setDayOfYear] = useState(172);
  const [coverageLevel, setCoverageLevel] = useState(25);
  const [playing, setPlaying] = useState(false);
  const [agencyFilter, setAgencyFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(facilities[1]);
  const [mapMode, setMapMode] = useState<MapMode>("capitol");
  const [electricityRate, setElectricityRate] = useState(PLANNING_ELECTRICITY_RATE);
  const [emissionsFactor, setEmissionsFactor] = useState(PLANNING_GRID_LB_CO2_PER_KWH);

  const visible = useMemo(() => facilities.filter((facility) => {
    const agencyMatch = agencyFilter === "ALL" || facility.agency.code === agencyFilter;
    const query = search.trim().toLowerCase();
    const searchMatch = !query || `${facility.name} ${facility.id} ${facility.address} ${facility.locality} ${facility.type}`.toLowerCase().includes(query);
    return agencyMatch && searchMatch;
  }), [agencyFilter, search]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setHour((value) => {
      if (value === 23) setDayOfYear((day) => day === 365 ? 1 : day + 1);
      return (value + 1) % 24;
    }), 650);
    return () => window.clearInterval(timer);
  }, [playing]);

  const impactRows = useMemo(() => visible.map((facility) => ({
    facility,
    impact: impactAtCoverage(facility, coverageLevel, electricityRate, emissionsFactor),
  })), [visible, coverageLevel, electricityRate, emissionsFactor]);

  const totals = useMemo(() => impactRows.reduce((sum, row) => {
    const { facility, impact } = row;
    const energy = energyAt(facility, hour, coverageLevel, dayOfYear);
    sum.load += energy.load;
    sum.pv += energy.pv;
    sum.grid += energy.grid;
    sum.pvCapacity += impact.activePvCapacity;
    sum.annualOffsetKwh += impact.annualOffsetKwh;
    sum.avoidedCost += impact.avoidedCost;
    sum.avoidedTons += impact.avoidedTons;
    return sum;
  }, { load: 0, pv: 0, grid: 0, pvCapacity: 0, annualOffsetKwh: 0, avoidedCost: 0, avoidedTons: 0 }), [impactRows, hour, dayOfYear, coverageLevel]);

  const activeSelected = visible.find((facility) => facility.id === selected.id) ?? visible[0] ?? selected;
  const selectedEnergy = energyAt(activeSelected, hour, coverageLevel, dayOfYear);
  const selectedCoverage = selectedEnergy.load ? Math.min(100, Math.round(selectedEnergy.pv / selectedEnergy.load * 100)) : 0;
  const selectedImpact = impactRows.find((row) => row.facility.id === activeSelected.id)?.impact ?? impactAtCoverage(activeSelected, coverageLevel, electricityRate, emissionsFactor);
  const selectedAnnualLoadKwh = annualElectricityKwh(activeSelected);
  const selectedDemandOffset = selectedAnnualLoadKwh ? selectedImpact.annualOffsetKwh / selectedAnnualLoadKwh * 100 : 0;
  const selectedSelfConsumption = selectedImpact.annualPvKwh ? selectedImpact.annualOffsetKwh / selectedImpact.annualPvKwh * 100 : 0;
  const selectedPvYield = selectedImpact.activePvCapacity ? selectedImpact.annualPvKwh / selectedImpact.activePvCapacity : 0;
  const chartData = Array.from({ length: 24 }, (_, chartHour) => energyAt(activeSelected, chartHour, coverageLevel, dayOfYear));
  const chartMax = Math.max(...chartData.map((point) => Math.max(point.load, point.pv)), 1);
  const linePoints = (key: "load" | "pv") => chartData.map((point, index) => `${(index / 23) * 100},${44 - (point[key] / chartMax) * 38}`).join(" ");
  const dailyBalancePoints = (key: "load" | "pv") => chartData.map((point, index) => `${34 + (index / 23) * 546},${130 - (point[key] / chartMax) * 106}`).join(" ");
  const dailyPvTotal = chartData.reduce((sum, point) => sum + point.pv, 0);
  const dailyLoadTotal = chartData.reduce((sum, point) => sum + point.load, 0);
  const dailySolarUsed = chartData.reduce((sum, point) => sum + Math.min(point.pv, point.load), 0);
  const dailySelfConsumption = dailyPvTotal ? dailySolarUsed / dailyPvTotal * 100 : 0;
  const dailyDemandOffset = dailyLoadTotal ? dailySolarUsed / dailyLoadTotal * 100 : 0;
  const monthlyProfile = useMemo(() => Array.from({ length: 12 }, (_, month) => {
    const start = Math.floor(Date.UTC(2026, month, 1) - Date.UTC(2026, 0, 1)) / 86400000 + 1;
    const end = Math.floor(Date.UTC(2026, month + 1, 1) - Date.UTC(2026, 0, 1)) / 86400000;
    let load = 0; let pv = 0;
    for (let day = start; day <= end; day += 1) for (let monthlyHour = 0; monthlyHour < 24; monthlyHour += 1) {
      const point = energyAt(activeSelected, monthlyHour, coverageLevel, day);
      load += point.load; pv += point.pv;
    }
    return { month, load, pv };
  }), [activeSelected, coverageLevel]);
  const monthlyMax = Math.max(...monthlyProfile.map((point) => Math.max(point.load, point.pv)), 1);
  const monthlyPvMax = Math.max(...monthlyProfile.map((point) => point.pv), 1);
  const peakPvMonth = monthlyProfile.reduce((best, point) => point.pv > best.pv ? point : best, monthlyProfile[0]);
  const coverageScenarios = useMemo(() => [25,50,75,100].map((level) => ({
    level,
    impact: impactAtCoverage(activeSelected, level, electricityRate, emissionsFactor),
  })), [activeSelected, electricityRate, emissionsFactor]);
  const scenarioMaxPv = Math.max(...coverageScenarios.map((scenario) => scenario.impact.annualPvKwh), 1);
  const scenarioCurvePoints = coverageScenarios.map((scenario, index) => `${24 + index * 100},${104 - scenario.impact.annualPvKwh / scenarioMaxPv * 76}`).join(" ");
  const selectedOfficialImage = officialFacilityImages[activeSelected.id];
  const rankedInsights = useMemo(() => [...impactRows].sort((a, b) => b.impact.annualPvKwh - a.impact.annualPvKwh), [impactRows]);
  const developedRoofArea = impactRows.reduce((sum, row) => sum + row.impact.selectedRoofArea, 0);
  const averageUsableRoofShare = visible.length ? visible.reduce((sum, facility) => sum + facility.roofUsableShare, 0) / visible.length : 0;
  const historicSiteCount = visible.filter((facility) => facility.year !== null && facility.year < 1935).length;
  const liveSolarShare = totals.load ? Math.min(100, totals.pv / totals.load * 100) : 0;

  return <main className="app-shell">
    <header className="topbar">
      <div className="header-copy">
        <a className="commonwealth-brand" href="https://www.virginia.gov/" target="_blank" rel="noreferrer" aria-label="Visit the official Commonwealth of Virginia website">
          <span className="commonwealth-logo-tile"><img src="https://www.virginia.gov/media/developer/assets/img/bbar_logos_blue.png" alt="" loading="eager" decoding="async" referrerPolicy="no-referrer" /></span>
          <span><strong>Commonwealth of Virginia</strong><small>Facility Energy Twin</small></span>
        </a>
        <p className="eyebrow">Source-referenced public-facility digital twin</p>
        <h1>State Facility Portfolio at Richmond</h1><p className="subtitle">Compare higher-fidelity exterior and rooftop digital twins, inspect sloped PV layouts, and evaluate a full year of energy, cost and emissions outcomes.</p>
      </div>
    </header>

    <section className="metrics" aria-label="Portfolio energy summary">
      <article className="metric-card"><span>Real facility sites shown</span><strong>{visible.length}<small> / {facilities.length}</small></strong><em>{agencyFilter === "ALL" ? "Publicly listed DGS portfolio" : agencyFilter}</em></article>
      <article className="metric-card load-card"><span>Simulated electric demand</span><strong>{(totals.load / 1000).toFixed(1)}<small> MW</small></strong><em>{formatDay(dayOfYear)} · {formatHour(hour)}</em></article>
      <article className="metric-card emissions-card"><span>Annual avoided emissions</span><strong>{compactNumber(totals.avoidedTons)}<small> tons</small></strong><em>{coverageLevel}% of technically usable roof</em></article>
      <article className="metric-card savings-card"><span>Annual avoided electricity cost</span><strong>{compactCurrency(totals.avoidedCost)}</strong><em>Gross value before project costs</em></article>
    </section>

    <section className="control-bar" aria-label="Portfolio controls">
      <label><span>Agency</span><select value={agencyFilter} onChange={(event) => setAgencyFilter(event.target.value)}>
        <option value="ALL">All agencies</option>{agencies.map((agency) => <option key={agency.code} value={agency.code}>{agency.code} — {agency.name}</option>)}
      </select></label>
      <label className="search-control"><span>Find a facility</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Building, address, ID or locality" /></label>
      <div className="coverage-control"><span>Usable rooftop developed for PV</span><div role="group" aria-label="Rooftop PV coverage scenario">
        {[25,50,75,100].map((level) => <button key={level} type="button" className={coverageLevel === level ? "is-active" : ""} aria-pressed={coverageLevel === level} onClick={() => setCoverageLevel(level)}>{level}%</button>)}
      </div></div>
      <div className="hour-control"><button type="button" className="play-button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause annual animation" : "Play annual animation"}>{playing ? "Pause" : "Play year"}</button>
        <label htmlFor="hour-range"><span>Portfolio hour</span><strong>{formatHour(hour)}</strong></label>
        <input id="hour-range" type="range" min="0" max="23" step="1" value={hour} onChange={(event) => { setPlaying(false); setHour(Number(event.target.value)); }} /></div>
    </section>

    <section className="year-control" aria-label="Full-year simulation date">
      <div><p className="eyebrow">8,760-hour simulation</p><strong>{formatDay(dayOfYear)}, 2026</strong><span>Day {dayOfYear} of 365</span></div>
      <input aria-label={`Simulation date ${formatDay(dayOfYear)}`} type="range" min="1" max="365" step="1" value={dayOfYear} onChange={(event) => { setPlaying(false); setDayOfYear(Number(event.target.value)); }} />
      <div className="season-labels"><span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span></div>
    </section>

    <section className="assumption-panel" aria-label="Advanced scenario assumptions">
      <div><p className="eyebrow">Advanced assumptions</p><strong>Adjust avoided-impact values</strong><span>All results update instantly across the portfolio.</span></div>
      <label><span>Electricity value <strong>${electricityRate.toFixed(2)}/kWh</strong></span><input type="range" min="0.05" max="0.30" step="0.01" value={electricityRate} onChange={(event) => setElectricityRate(Number(event.target.value))} /></label>
      <label><span>Grid emissions <strong>{emissionsFactor.toFixed(2)} lb CO₂e/kWh</strong></span><input type="range" min="0.10" max="1.50" step="0.05" value={emissionsFactor} onChange={(event) => setEmissionsFactor(Number(event.target.value))} /></label>
    </section>

    <section className="portfolio-workspace">
      <div className="map-panel">
        <div className="panel-heading"><div><p className="eyebrow">Live geographic context</p><h2>Real Richmond facilities on satellite imagery</h2></div>
          <div className="map-heading-actions"><span className="map-count">{visible.length} buildings</span><div className="map-switch" role="group" aria-label="Map extent">
            <button type="button" className={mapMode === "capitol" ? "is-active" : ""} onClick={() => setMapMode("capitol")}>Capitol area</button>
            <button type="button" className={mapMode === "all" ? "is-active" : ""} onClick={() => setMapMode("all")}>All locations</button>
          </div></div></div>
        {visible.length ? <PortfolioMap visible={visible} selected={activeSelected} hour={hour} coverage={coverageLevel} dayOfYear={dayOfYear} mode={mapMode} onSelect={setSelected} /> : <div className="empty-state">No facilities match the current filters.</div>}
        <p className="data-note">Physical locations come from publicly listed Virginia DGS facility addresses and public building records. Electricity, rooftop-PV, EUI and modeled floor-area values are synthetic planning placeholders. <a href="https://dgs.virginia.gov/dcss/dgs-facilities-information/dgs-managed-facilities" target="_blank" rel="noreferrer">DGS facility source</a></p>
        <section className="map-intelligence-grid" aria-label={`Visual and scenario analysis for ${activeSelected.name}`}>
          <article className="facility-reference-card">
            {selectedOfficialImage
              ? <img src={selectedOfficialImage} alt={`Official Virginia DGS exterior reference for ${activeSelected.name}`} loading="lazy" />
              : <div className="reference-image-fallback" aria-hidden="true"><span /><span /><span /><span /></div>}
            <div className="reference-image-shade" />
            <div className="reference-image-copy"><span>Official DGS exterior reference</span><strong>{activeSelected.name}</strong><small>{activeSelected.year ?? "Year not listed"} · {activeSelected.floors} {activeSelected.floors === 1 ? "floor" : "floors"}</small></div>
            <a href="https://dgs.virginia.gov/dcss/dgs-facilities-information/dgs-managed-facilities" target="_blank" rel="noreferrer" aria-label={`Open the official DGS facility reference for ${activeSelected.name}`}>Source ↗</a>
          </article>
          <article className="coverage-curve-card">
            <div className="visual-card-heading"><div><span>PV coverage curve</span><strong>Annual rooftop output</strong></div><em>{compactNumber(selectedImpact.annualPvKwh / 1000)} MWh at {coverageLevel}%</em></div>
            <svg viewBox="0 0 348 122" role="img" aria-label={`Annual PV output for ${activeSelected.name} at 25, 50, 75 and 100 percent roof coverage`}>
              <defs><linearGradient id="scenario-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5fe1a7" stopOpacity=".38"/><stop offset="100%" stopColor="#5fe1a7" stopOpacity="0"/></linearGradient></defs>
              {[28,54,80,106].map((gridY) => <line key={gridY} x1="18" y1={gridY} x2="330" y2={gridY} className="scenario-grid-line" />)}
              <polygon points={`24,108 ${scenarioCurvePoints} 324,108`} fill="url(#scenario-area)" />
              <polyline points={scenarioCurvePoints} className="scenario-output-line" />
              {coverageScenarios.map((scenario, index) => <g key={scenario.level}>
                <circle cx={24 + index * 100} cy={104 - scenario.impact.annualPvKwh / scenarioMaxPv * 76} r={scenario.level === coverageLevel ? 6 : 4} className={scenario.level === coverageLevel ? "scenario-point is-active" : "scenario-point"} aria-label={`${scenario.level}% coverage: ${Math.round(scenario.impact.annualPvKwh / 1000)} MWh and ${compactCurrency(scenario.impact.avoidedCost)} avoided cost`} />
                <text x={24 + index * 100} y="120" className="scenario-axis-label">{scenario.level}%</text>
              </g>)}
            </svg>
            <div className="curve-metrics"><span><small>Avoided cost</small><strong>{compactCurrency(selectedImpact.avoidedCost)}</strong></span><span><small>CO₂e avoided</small><strong>{compactNumber(selectedImpact.avoidedTons)} t</strong></span><span><small>PV capacity</small><strong>{compactNumber(selectedImpact.activePvCapacity)} kW</strong></span></div>
          </article>
        </section>
        <article className="solar-yield-card" aria-label={`Monthly rooftop solar yield for ${activeSelected.name}`}>
          <div className="visual-card-heading"><div><span>Full-year solar signature</span><strong>Monthly rooftop generation</strong></div><em>Peak · {new Intl.DateTimeFormat("en-US", { month:"short", timeZone:"UTC" }).format(new Date(Date.UTC(2026, peakPvMonth.month, 1)))}</em></div>
          <div className="solar-yield-bars">{monthlyProfile.map((point) => {
            const monthName = new Intl.DateTimeFormat("en-US", { month:"short", timeZone:"UTC" }).format(new Date(Date.UTC(2026, point.month, 1)));
            return <div key={point.month} title={`${monthName}: ${Math.round(point.pv / 1000)} MWh rooftop PV`}><i style={{ height:`${Math.max(8, point.pv / monthlyPvMax * 100)}%` }} /><span>{monthName}</span></div>;
          })}</div>
          <div className="yield-footer"><span><i className="yield-dot" />Modeled PV generation</span><strong>{compactNumber(selectedImpact.annualPvKwh / 1000)} MWh/year</strong><em>{selectedDemandOffset.toFixed(1)}% annual demand offset</em></div>
        </article>
        <article className="daily-balance-card" aria-label={`Selected-day electricity balance for ${activeSelected.name}`}>
          <div className="visual-card-heading"><div><span>Selected-day energy balance</span><strong>Load, rooftop PV and grid interaction</strong></div><em>{formatDay(dayOfYear)} · cursor at {formatHour(hour)}</em></div>
          <svg viewBox="0 0 612 166" role="img" aria-label={`Twenty-four hour load and photovoltaic profile for ${activeSelected.name}`}>
            <defs><linearGradient id="daily-pv-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5fe1a7" stopOpacity=".34"/><stop offset="100%" stopColor="#5fe1a7" stopOpacity=".02"/></linearGradient></defs>
            <rect x="176" y="18" width="284" height="112" rx="7" className="daylight-window" />
            {[24,59,94,130].map((gridY) => <line key={gridY} x1="34" y1={gridY} x2="580" y2={gridY} className="balance-grid-line" />)}
            <polygon points={`34,130 ${dailyBalancePoints("pv")} 580,130`} fill="url(#daily-pv-area)" />
            <polyline points={dailyBalancePoints("load")} className="balance-load-line" />
            <polyline points={dailyBalancePoints("pv")} className="balance-pv-line" />
            <line x1={34 + hour / 23 * 546} y1="17" x2={34 + hour / 23 * 546} y2="132" className="balance-cursor" />
            <circle cx={34 + hour / 23 * 546} cy={130 - selectedEnergy.load / chartMax * 106} r="4" className="balance-load-point" />
            <circle cx={34 + hour / 23 * 546} cy={130 - selectedEnergy.pv / chartMax * 106} r="4" className="balance-pv-point" />
            {[{x:34,label:"12a"},{x:176,label:"6a"},{x:318,label:"12p"},{x:460,label:"6p"},{x:580,label:"11p"}].map((tick) => <text key={tick.label} x={tick.x} y="153" className="balance-axis-label">{tick.label}</text>)}
            <text x="189" y="31" className="daylight-label">DAYLIGHT WINDOW</text>
          </svg>
          <div className="balance-footer">
            <span><small>Current load</small><strong>{compactNumber(selectedEnergy.load)} kW</strong></span>
            <span><small>Current PV</small><strong>{compactNumber(selectedEnergy.pv)} kW</strong></span>
            <span><small>Daily solar used</small><strong>{dailySelfConsumption.toFixed(0)}%</strong></span>
            <span><small>Daily demand offset</small><strong>{dailyDemandOffset.toFixed(0)}%</strong></span>
          </div>
        </article>
        <section className="facility-scenario-studio" aria-label="Rooftop coverage scenario studio">
          <div className="scenario-studio-heading">
            <div><p className="eyebrow">Scenario studio</p><h3>Compare rooftop buildout</h3></div>
            <span>Select a level to update the digital twin</span>
          </div>
          <div className="scenario-studio-grid">
            {coverageScenarios.map((scenario) => <button
              type="button"
              key={scenario.level}
              className={scenario.level === coverageLevel ? "is-active" : ""}
              onClick={() => setCoverageLevel(scenario.level)}
              aria-pressed={scenario.level === coverageLevel}
              aria-label={`Use ${scenario.level}% of the technically usable roof for rooftop PV`}
            >
              <span className="scenario-studio-level"><strong>{scenario.level}%</strong><span>{formatNumber(Math.round(scenario.impact.selectedRoofArea))} sq. ft.</span></span>
              <span className="scenario-studio-track"><i style={{ width:`${scenario.level}%` }} /></span>
              <span className="scenario-studio-values">
                <span><small>PV capacity</small><b>{compactNumber(scenario.impact.activePvCapacity)} kW</b></span>
                <span><small>Annual output</small><b>{compactNumber(scenario.impact.annualPvKwh / 1000)} MWh</b></span>
                <span><small>Avoided cost</small><b>{compactCurrency(scenario.impact.avoidedCost)}/yr</b></span>
                <span><small>Avoided CO₂e</small><b>{compactNumber(scenario.impact.avoidedTons)} t/yr</b></span>
              </span>
            </button>)}
          </div>
          <div className="planning-horizon" aria-label="Long-term planning outlook">
            <div><span>25-year gross avoided value</span><strong>{compactCurrency(selectedImpact.avoidedCost * 25)}</strong><small>Flat electricity value; project costs excluded</small></div>
            <div><span>25-year avoided emissions</span><strong>{compactNumber(selectedImpact.avoidedTons * 25)} tons</strong><small>Constant planning emissions factor</small></div>
            <div><span>Annual demand offset</span><strong>{selectedDemandOffset.toFixed(1)}%</strong><small>Modeled full-year facility demand</small></div>
          </div>
        </section>
      </div>

      <aside className="detail-panel">
        <FacilityModel key={activeSelected.id} facility={activeSelected} hour={hour} coverage={coverageLevel} dayOfYear={dayOfYear} energy={selectedEnergy} impact={selectedImpact} />
        <div className="facility-heading"><div><p className="eyebrow">Selected real facility</p><h2>{activeSelected.name}</h2></div><span>{activeSelected.id}</span></div>
        <p className="agency-name"><strong>{activeSelected.address}, {activeSelected.locality}, VA</strong><span>{activeSelected.agency.name}</span></p>
        <p className="architecture-source"><strong>Model basis:</strong> building-specific massing interpreted from satellite imagery, published exterior references, documented floor count, roof form and façade rhythm. Generic rooftop boxes are not used; penthouses and roof structures appear only where supported by the building profile. {activeSelected.id === "DGS-738" ? <>The Capitol additionally follows <a href="https://www.google.com/maps/place/Virginia+State+Capitol/" target="_blank" rel="noreferrer">Street View</a> and the <a href="https://www.loc.gov/pictures/item/va1498/" target="_blank" rel="noreferrer">HABS measured record</a>.</> : activeSelected.id === "DGS-702" ? <>The Washington Building exterior follows its official <a href="https://www.dhr.virginia.gov/VLR_to_transfer/PDFNoms/127-6518_Washington_Building_2010_NRHP_final.pdf" target="_blank" rel="noreferrer">National Register documentation</a>: twelve-story V/U plan, tapered massing, four historically rounded outer corners, two straight Bank Street entrance joints and a deep cornice. The rooftop planning view uses the broad open low-slope zones visible in the current aerial reference.</> : <>Exterior geometry is a visual reference twin; exact survey geometry requires the facility’s BIM/CAD or LiDAR scan.</>}</p>
        <div className="impact-summary" aria-label={`${coverageLevel}% rooftop PV coverage planning impact`}>
          <div><span>Gross top-floor roof</span><strong>{formatNumber(Math.round(selectedImpact.grossRoofArea))} sq. ft.</strong></div>
          <div><span>Technically usable roof</span><strong>{formatNumber(Math.round(selectedImpact.technicallyUsableRoofArea))} sq. ft.</strong></div>
          <div><span>Rooftop used for PV</span><strong>{formatNumber(Math.round(selectedImpact.selectedRoofArea))} sq. ft.</strong></div>
          <div><span>Installed PV capacity</span><strong>{compactNumber(selectedImpact.activePvCapacity)} kW</strong></div>
          <div><span>Annual PV generation</span><strong>{compactNumber(selectedImpact.annualPvKwh / 1000)} MWh</strong></div>
          <div><span>PV energy used on site</span><strong>{selectedSelfConsumption.toFixed(1)}%</strong></div>
          <div><span>Annual demand offset</span><strong>{selectedDemandOffset.toFixed(1)}%</strong></div>
          <div><span>Specific PV yield</span><strong>{compactNumber(selectedPvYield)} kWh/kW</strong></div>
          <div><span>Avoided emissions</span><strong>{compactNumber(selectedImpact.avoidedTons)} tons</strong></div>
          <div><span>Avoided cost</span><strong>{compactCurrency(selectedImpact.avoidedCost)} / yr</strong></div>
        </div>
        <p className="impact-note">Planning assumptions: {coverageLevel}% of the technically usable roof is developed with a sloped conceptual array. Usable roof is {Math.round(activeSelected.roofUsableShare * 100)}% of gross top-floor area after preliminary allowances for {activeSelected.roofConstraint.toLowerCase()}. Avoided value uses ${electricityRate.toFixed(2)}/kWh and {emissionsFactor.toFixed(2)} lb CO₂e/kWh; project costs are excluded.</p>

        <p className="section-kicker"><span>Simulated energy</span>{formatDay(dayOfYear)} · {formatHour(hour)}</p>
        <div className="selected-energy">
          <div><span>Load</span><strong>{selectedEnergy.load} kW</strong></div>
          <div><span>PV output</span><strong>{selectedEnergy.pv} kW</strong></div>
          <div><span>{selectedEnergy.grid >= 0 ? "Grid import" : "Grid export"}</span><strong>{Math.abs(selectedEnergy.grid)} kW</strong></div>
        </div>
        <div className="energy-chart" aria-label="24-hour load and photovoltaic generation profile">
          <div><span>24-hour operating profile</span><p><i className="chart-key load-key" />Load <i className="chart-key pv-key" />PV</p></div>
          <svg viewBox="0 0 100 48" role="img" aria-label="Hourly load and PV line chart">
            <line x1="0" y1="44" x2="100" y2="44" className="chart-axis" />
            <line x1={`${hour / 23 * 100}`} y1="3" x2={`${hour / 23 * 100}`} y2="44" className="chart-cursor" />
            <polyline points={linePoints("load")} className="load-line" />
            <polyline points={linePoints("pv")} className="pv-line" />
          </svg>
          <div className="chart-hours"><span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>11p</span></div>
        </div>
        <div className="monthly-chart" aria-label="Twelve-month electricity and photovoltaic energy profile">
          <div><span>Full-year monthly energy</span><p><i className="chart-key load-key" />Load <i className="chart-key pv-key" />PV</p></div>
          <div className="month-bars">{monthlyProfile.map((point) => <div key={point.month} title={`${new Intl.DateTimeFormat("en-US", { month:"long", timeZone:"UTC" }).format(new Date(Date.UTC(2026, point.month, 1)))}: load ${Math.round(point.load / 1000)} MWh, PV ${Math.round(point.pv / 1000)} MWh`}>
            <i className="month-load" style={{ height:`${Math.max(3, point.load / monthlyMax * 100)}%` }} />
            <i className="month-pv" style={{ height:`${Math.max(2, point.pv / monthlyMax * 100)}%` }} />
            <span>{new Intl.DateTimeFormat("en-US", { month:"narrow", timeZone:"UTC" }).format(new Date(Date.UTC(2026, point.month, 1)))}</span>
          </div>)}</div>
        </div>
        <div className="coverage-row"><span>Live demand served by PV</span><div className="coverage-track"><i style={{ width: `${selectedCoverage}%` }} /></div><strong>{selectedCoverage}%</strong></div>
        <dl className="facility-facts">
          <div><dt>Facility type</dt><dd>{activeSelected.type}</dd></div><div><dt>Locality</dt><dd>{activeSelected.locality}</dd></div>
          <div><dt>Modeled floor area</dt><dd>{formatNumber(activeSelected.area)} sq. ft.</dd></div><div><dt>Documented floors</dt><dd><span className="verified-dot" />{activeSelected.floors}</dd></div>
          <div><dt>Floor source</dt><dd>{activeSelected.floorSource}</dd></div><div><dt>Year built</dt><dd>{activeSelected.year ?? "Not published"}</dd></div>
          <div><dt>Simulated EUI</dt><dd>{activeSelected.eui} kBtu/sq. ft.</dd></div><div><dt>Simulated peak demand</dt><dd>{activeSelected.peakLoad} kW</dd></div>
          <div><dt>Gross rooftop area</dt><dd>{formatNumber(activeSelected.roofArea)} sq. ft.</dd></div><div><dt>Technically usable roof</dt><dd>{formatNumber(Math.round(selectedImpact.technicallyUsableRoofArea))} sq. ft.</dd></div>
          <div><dt>PV capacity at 100%</dt><dd>{activeSelected.pvCapacity} kW</dd></div><div><dt>Coordinates</dt><dd>{activeSelected.lat.toFixed(5)}, {activeSelected.lon.toFixed(5)}</dd></div>
        </dl>
      </aside>
    </section>

    <section className="portfolio-insights" aria-labelledby="portfolio-insights-title">
      <div className="insights-heading"><div><p className="eyebrow">Portfolio intelligence</p><h2 id="portfolio-insights-title">What the current scenario reveals</h2></div><p>{coverageLevel}% of technically usable rooftop · {formatDay(dayOfYear)} at {formatHour(hour)}</p></div>
      <div className="insight-metrics">
        <article><span>Developed roof area</span><strong>{compactNumber(developedRoofArea)} <small>sq. ft.</small></strong><em>Across {visible.length} visible facilities</em></article>
        <article><span>Installed portfolio PV</span><strong>{compactNumber(totals.pvCapacity)} <small>kW</small></strong><em>Scenario capacity</em></article>
        <article><span>Live solar contribution</span><strong>{liveSolarShare.toFixed(1)}<small>%</small></strong><em>Share of load at the selected hour</em></article>
        <article><span>Average usable roof</span><strong>{(averageUsableRoofShare * 100).toFixed(0)}<small>%</small></strong><em>{historicSiteCount} historic sites need closer review</em></article>
      </div>
      <div className="insight-layout">
        <article className="opportunity-panel">
          <div><p className="eyebrow">Priority opportunities</p><h3>Highest annual rooftop-PV output</h3></div>
          <div className="opportunity-list" role="list">
            {rankedInsights.slice(0, 6).map((row, index) => <button type="button" role="listitem" key={row.facility.id} onClick={() => { setSearch(""); setSelected(row.facility); }}>
              <b>{String(index + 1).padStart(2, "0")}</b><span><strong>{row.facility.name}</strong><small>{compactNumber(row.impact.selectedRoofArea)} sq. ft. developed</small></span><em>{compactNumber(row.impact.annualPvKwh / 1000)} MWh/yr</em>
            </button>)}
          </div>
        </article>
        <article className="decision-panel">
          <p className="eyebrow">Decision signals</p><h3>Planning interpretation</h3>
          <div className="signal-list">
            <div><span>01</span><p><strong>Lead opportunity</strong>{rankedInsights[0] ? `${rankedInsights[0].facility.name} produces the most annual rooftop solar in the current filtered scenario.` : "No facility is visible under the current filters."}</p></div>
            <div><span>02</span><p><strong>Historic constraints</strong>{historicSiteCount} visible facilities predate 1935, so sightlines, structure and preservation review may reduce practical rooftop development.</p></div>
            <div><span>03</span><p><strong>Operational value</strong>The selected scenario avoids {compactCurrency(totals.avoidedCost)} per year and {compactNumber(totals.avoidedTons)} tons of CO₂e before project costs.</p></div>
            <div><span>04</span><p><strong>Next accuracy step</strong>Exterior massing follows public imagery and records; survey-grade twins and exact interiors require agency BIM/CAD, LiDAR or measured floor plans.</p></div>
          </div>
        </article>
      </div>
    </section>
  </main>;
}
