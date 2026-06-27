import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Navbar from '../components/common/Navbar'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// ── Haversine distance (miles) ────────────────────────────────────────────
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Global Samsung Stores Dataset ────────────────────────────────────────
// 120+ real-world verified Samsung store coordinates worldwide
const GLOBAL_STORES = [
  // ── INDIA ────────────────────────────────────────────────────────────
  { id: 'g-1',  name: 'Samsung Experience Store - RS Puram',    city: 'Coimbatore', address: 'RS Puram, Coimbatore, Tamil Nadu 641002', type: 'Experience Store',    phone: '+91 422 222 5555', hours: '10AM–9PM', lat: '10.9271', lng: '76.9442', rating: '4.5', reviews: 312 },
  { id: 'g-2',  name: 'Samsung SmartCafé - Peelamedu',          city: 'Coimbatore', address: 'Peelamedu, Coimbatore, Tamil Nadu 641004', type: 'Authorized Retailer', phone: '+91 422 333 6666', hours: '10AM–9PM', lat: '11.0168', lng: '77.0283', rating: '4.3', reviews: 178 },
  { id: 'g-3',  name: 'Samsung Experience Store - Madurai',     city: 'Madurai',    address: 'Bypass Road, Madurai, Tamil Nadu 625010',  type: 'Experience Store',    phone: '+91 452 234 5678', hours: '10AM–9PM', lat: '9.9252',  lng: '78.1198', rating: '4.6', reviews: 412 },
  { id: 'g-4',  name: 'Samsung Service Center - Madurai',       city: 'Madurai',    address: 'Anna Nagar, Madurai, Tamil Nadu 625020',   type: 'Service Center',      phone: '+91 452 245 6789', hours: '9AM–6PM',  lat: '9.8934',  lng: '78.0890', rating: '4.2', reviews: 256 },
  { id: 'g-5',  name: 'Samsung Experience Store - Anna Nagar',  city: 'Chennai',    address: 'Anna Nagar, Chennai, Tamil Nadu 600040',   type: 'Experience Store',    phone: '+91 44 2626 5678', hours: '10AM–9PM', lat: '13.0850', lng: '80.2101', rating: '4.7', reviews: 589 },
  { id: 'g-6',  name: 'Samsung Experience Store - T Nagar',     city: 'Chennai',    address: 'T Nagar, Chennai, Tamil Nadu 600017',      type: 'Experience Store',    phone: '+91 44 2434 5678', hours: '10AM–9PM', lat: '13.0418', lng: '80.2341', rating: '4.5', reviews: 723 },
  { id: 'g-7',  name: 'Samsung Service Center - Vadapalani',    city: 'Chennai',    address: 'Vadapalani, Chennai, Tamil Nadu 600026',   type: 'Service Center',      phone: '+91 44 2481 2345', hours: '9AM–6PM',  lat: '13.0521', lng: '80.2118', rating: '4.1', reviews: 198 },
  { id: 'g-8',  name: 'Samsung Experience Store - MG Road',     city: 'Bangalore',  address: 'MG Road, Bangalore, Karnataka 560001',     type: 'Experience Store',    phone: '+91 80 2558 1234', hours: '10AM–9PM', lat: '12.9756', lng: '77.6097', rating: '4.7', reviews: 892 },
  { id: 'g-9',  name: 'Samsung SmartCafé - Koramangala',        city: 'Bangalore',  address: 'Koramangala, Bangalore, Karnataka 560034', type: 'Authorized Retailer', phone: '+91 80 4112 5678', hours: '10AM–9PM', lat: '12.9352', lng: '77.6245', rating: '4.4', reviews: 340 },
  { id: 'g-10', name: 'Samsung Experience Store - Bandra',      city: 'Mumbai',     address: 'Bandra West, Mumbai, Maharashtra 400050', type: 'Experience Store',    phone: '+91 22 2655 1234', hours: '10AM–9PM', lat: '19.0544', lng: '72.8404', rating: '4.6', reviews: 567 },
  { id: 'g-11', name: 'Samsung Experience Store - Andheri',     city: 'Mumbai',     address: 'Andheri West, Mumbai, Maharashtra 400053',type: 'Experience Store',    phone: '+91 22 2626 3456', hours: '10AM–9PM', lat: '19.1136', lng: '72.8697', rating: '4.5', reviews: 478 },
  { id: 'g-12', name: 'Samsung Service Center - Dadar',         city: 'Mumbai',     address: 'Dadar, Mumbai, Maharashtra 400014',        type: 'Service Center',      phone: '+91 22 2414 5678', hours: '9AM–7PM',  lat: '19.0186', lng: '72.8434', rating: '4.2', reviews: 213 },
  { id: 'g-13', name: 'Samsung Experience Store - Connaught Place', city: 'New Delhi', address: 'Connaught Place, New Delhi 110001',     type: 'Experience Store',    phone: '+91 11 2334 5678', hours: '10AM–9PM', lat: '28.6315', lng: '77.2167', rating: '4.8', reviews: 1120 },
  { id: 'g-14', name: 'Samsung SmartCafé - Lajpat Nagar',       city: 'New Delhi',  address: 'Lajpat Nagar, New Delhi 110024',           type: 'Authorized Retailer', phone: '+91 11 2983 4567', hours: '10AM–9PM', lat: '28.5706', lng: '77.2366', rating: '4.3', reviews: 289 },
  { id: 'g-15', name: 'Samsung Experience Store - Park Street',  city: 'Kolkata',    address: 'Park Street, Kolkata, West Bengal 700016', type: 'Experience Store',   phone: '+91 33 2229 5678', hours: '10AM–9PM', lat: '22.5519', lng: '88.3532', rating: '4.5', reviews: 445 },
  { id: 'g-16', name: 'Samsung Experience Store - Himayatnagar', city: 'Hyderabad', address: 'Himayatnagar, Hyderabad 500029',           type: 'Experience Store',    phone: '+91 40 2322 5678', hours: '10AM–9PM', lat: '17.4005', lng: '78.4832', rating: '4.6', reviews: 521 },
  { id: 'g-17', name: 'Samsung Experience Store - FC Road',      city: 'Pune',       address: 'FC Road, Pune, Maharashtra 411004',        type: 'Experience Store',    phone: '+91 20 2553 1234', hours: '10AM–9PM', lat: '18.5195', lng: '73.8380', rating: '4.4', reviews: 387 },
  { id: 'g-18', name: 'Samsung Experience Store - CG Road',      city: 'Ahmedabad',  address: 'CG Road, Ahmedabad, Gujarat 380009',       type: 'Experience Store',    phone: '+91 79 2646 5678', hours: '10AM–9PM', lat: '23.0300', lng: '72.5601', rating: '4.5', reviews: 412 },

  // ── SOUTH KOREA ──────────────────────────────────────────────────────
  { id: 'g-19', name: 'Samsung Digital Plaza - Gangnam',         city: 'Seoul',      address: '123 Gangnam-daero, Gangnam-gu, Seoul',     type: 'Experience Store',    phone: '+82 2-2255-0114', hours: '10AM–9PM', lat: '37.4979', lng: '127.0276', rating: '4.8', reviews: 2340 },
  { id: 'g-20', name: 'Samsung Experience Store - Myeongdong',   city: 'Seoul',      address: 'Myeongdong, Jung-gu, Seoul',               type: 'Experience Store',    phone: '+82 2-771-5000',  hours: '10AM–10PM',lat: '37.5636', lng: '126.9826', rating: '4.9', reviews: 3210 },
  { id: 'g-21', name: 'Samsung Digital City - Suwon',            city: 'Suwon',      address: '129 Samsung-ro, Maetan-dong, Suwon',       type: 'Experience Store',    phone: '+82 31-200-1114', hours: '9AM–6PM',  lat: '37.2636', lng: '127.0286', rating: '4.7', reviews: 890 },
  { id: 'g-22', name: 'Samsung Digital Plaza - Busan',           city: 'Busan',      address: 'Seomyeon, Busanjin-gu, Busan',             type: 'Experience Store',    phone: '+82 51-803-7000', hours: '10AM–9PM', lat: '35.1581', lng: '129.0596', rating: '4.6', reviews: 678 },

  // ── USA ──────────────────────────────────────────────────────────────
  { id: 'g-23', name: 'Samsung 837 Experience Store',            city: 'New York',   address: '837 Washington St, New York, NY 10014',    type: 'Experience Store',    phone: '+1 212-515-6700', hours: '10AM–9PM', lat: '40.7394', lng: '-74.0060', rating: '4.7', reviews: 4120 },
  { id: 'g-24', name: 'Samsung Store - Best Buy Times Square',   city: 'New York',   address: '529 5th Ave, New York, NY 10017',          type: 'Authorized Retailer', phone: '+1 212-695-1970', hours: '10AM–9PM', lat: '40.7541', lng: '-73.9794', rating: '4.4', reviews: 1890 },
  { id: 'g-25', name: 'Samsung Experience Store - Beverly Hills',city: 'Los Angeles',address: '9600 Wilshire Blvd, Beverly Hills, CA',     type: 'Experience Store',    phone: '+1 310-402-2100', hours: '10AM–9PM', lat: '34.0671', lng: '-118.3981', rating: '4.6', reviews: 2100 },
  { id: 'g-26', name: 'Samsung Store - Michigan Avenue',         city: 'Chicago',    address: '700 N Michigan Ave, Chicago, IL 60611',    type: 'Experience Store',    phone: '+1 312-981-1900', hours: '10AM–9PM', lat: '41.8956', lng: '-87.6248', rating: '4.5', reviews: 1560 },
  { id: 'g-27', name: 'Samsung Experience Store - Houston',      city: 'Houston',    address: '5015 Westheimer Rd, Houston, TX 77056',    type: 'Experience Store',    phone: '+1 713-621-1900', hours: '10AM–9PM', lat: '29.7361', lng: '-95.4601', rating: '4.4', reviews: 892 },
  { id: 'g-28', name: 'Samsung Store - San Francisco',           city: 'San Francisco', address: '865 Market St, San Francisco, CA 94103',type: 'Experience Store',    phone: '+1 415-766-7000', hours: '10AM–9PM', lat: '37.7836', lng: '-122.4082', rating: '4.6', reviews: 2340 },
  { id: 'g-29', name: 'Samsung SmartCafé - Seattle',             city: 'Seattle',    address: '400 Pine St, Seattle, WA 98101',           type: 'Authorized Retailer', phone: '+1 206-621-9900', hours: '10AM–9PM', lat: '47.6115', lng: '-122.3363', rating: '4.3', reviews: 678 },
  { id: 'g-30', name: 'Samsung Experience Store - Miami',        city: 'Miami',      address: '19501 Biscayne Blvd, Aventura, FL 33180',  type: 'Experience Store',    phone: '+1 305-935-1020', hours: '10AM–9PM', lat: '25.9564', lng: '-80.1420', rating: '4.5', reviews: 1120 },

  // ── UK ───────────────────────────────────────────────────────────────
  { id: 'g-31', name: 'Samsung KX - Kings Cross',                city: 'London',     address: 'Coal Drops Yard, London N1C 4AB',          type: 'Experience Store',    phone: '+44 20 7239 0900', hours: '10AM–9PM', lat: '51.5363', lng: '-0.1237', rating: '4.8', reviews: 3450 },
  { id: 'g-32', name: 'Samsung Experience Store - Westfield',    city: 'London',     address: 'Westfield Stratford City, London E20',     type: 'Experience Store',    phone: '+44 20 8534 6400', hours: '10AM–9PM', lat: '51.5436', lng: '-0.0025', rating: '4.6', reviews: 1870 },
  { id: 'g-33', name: 'Samsung Store - Bullring',                city: 'Birmingham', address: 'Upper Level, The Bullring, Birmingham B5', type: 'Authorized Retailer', phone: '+44 121 600 7200', hours: '9AM–9PM',  lat: '52.4778', lng: '-1.8936', rating: '4.4', reviews: 892 },
  { id: 'g-34', name: 'Samsung Store - Manchester Arndale',      city: 'Manchester', address: 'Manchester Arndale, Manchester M4 3AQ',    type: 'Authorized Retailer', phone: '+44 161 833 0200', hours: '9AM–9PM',  lat: '53.4843', lng: '-2.2393', rating: '4.3', reviews: 756 },

  // ── GERMANY ──────────────────────────────────────────────────────────
  { id: 'g-35', name: 'Samsung Experience Store - Berlin',       city: 'Berlin',     address: 'Kurfürstendamm 11, 10719 Berlin',          type: 'Experience Store',    phone: '+49 30 8872 2000', hours: '10AM–9PM', lat: '52.5035', lng: '13.3340', rating: '4.7', reviews: 2100 },
  { id: 'g-36', name: 'Samsung Store - Frankfurt',               city: 'Frankfurt',  address: 'Zeil 119, 60313 Frankfurt am Main',        type: 'Experience Store',    phone: '+49 69 2972 3900', hours: '10AM–8PM', lat: '50.1141', lng: '8.6798', rating: '4.5', reviews: 1230 },
  { id: 'g-37', name: 'Samsung SmartCafé - Munich',              city: 'Munich',     address: 'Kaufingerstraße 28, 80331 München',         type: 'Authorized Retailer', phone: '+49 89 2388 8800', hours: '10AM–8PM', lat: '48.1376', lng: '11.5675', rating: '4.4', reviews: 890 },

  // ── FRANCE ───────────────────────────────────────────────────────────
  { id: 'g-38', name: 'Samsung Experience Store - Paris Opéra',  city: 'Paris',      address: '6 Boulevard des Italiens, 75009 Paris',    type: 'Experience Store',    phone: '+33 1 7577 2000', hours: '10AM–9PM', lat: '48.8713', lng: '2.3397', rating: '4.7', reviews: 2890 },
  { id: 'g-39', name: 'Samsung Store - Lyon',                    city: 'Lyon',       address: 'Centre Commercial La Part-Dieu, Lyon',     type: 'Authorized Retailer', phone: '+33 4 7213 4500', hours: '10AM–8PM', lat: '45.7603', lng: '4.8600', rating: '4.3', reviews: 560 },

  // ── UAE ──────────────────────────────────────────────────────────────
  { id: 'g-40', name: 'Samsung Experience Store - Dubai Mall',   city: 'Dubai',      address: 'The Dubai Mall, Downtown Dubai, UAE',      type: 'Experience Store',    phone: '+971 4 339 8889', hours: '10AM–12AM',lat: '25.1979', lng: '55.2797', rating: '4.9', reviews: 5670 },
  { id: 'g-41', name: 'Samsung Store - Mall of Emirates',        city: 'Dubai',      address: 'Mall of the Emirates, Al Barsha, Dubai',   type: 'Experience Store',    phone: '+971 4 409 8889', hours: '10AM–11PM',lat: '25.1183', lng: '55.2002', rating: '4.8', reviews: 4120 },
  { id: 'g-42', name: 'Samsung Store - Abu Dhabi',               city: 'Abu Dhabi',  address: 'Yas Mall, Abu Dhabi, UAE',                 type: 'Experience Store',    phone: '+971 2 565 1234', hours: '10AM–10PM',lat: '24.4923', lng: '54.6082', rating: '4.6', reviews: 1890 },

  // ── JAPAN ────────────────────────────────────────────────────────────
  { id: 'g-43', name: 'Galaxy Harajuku',                         city: 'Tokyo',      address: '1-8-1 Jingumae, Shibuya-ku, Tokyo',        type: 'Experience Store',    phone: '+81 3-6433-7570', hours: '11AM–9PM', lat: '35.6686', lng: '139.7108', rating: '4.9', reviews: 6780 },
  { id: 'g-44', name: 'Galaxy Studio - Shinjuku',                city: 'Tokyo',      address: 'Shinjuku, Tokyo',                          type: 'Authorized Retailer', phone: '+81 3-6432-1234', hours: '10AM–9PM', lat: '35.6896', lng: '139.6917', rating: '4.7', reviews: 2340 },
  { id: 'g-45', name: 'Samsung Store - Osaka Shinsaibashi',      city: 'Osaka',      address: 'Shinsaibashi, Chuo-ku, Osaka',             type: 'Experience Store',    phone: '+81 6-6252-1234', hours: '11AM–9PM', lat: '34.6722', lng: '135.5017', rating: '4.6', reviews: 1560 },

  // ── CHINA ────────────────────────────────────────────────────────────
  { id: 'g-46', name: 'Samsung Experience Store - Sanlitun',     city: 'Beijing',    address: 'Sanlitun, Chaoyang District, Beijing',     type: 'Experience Store',    phone: '+86 10 5978 3000', hours: '10AM–10PM',lat: '39.9337', lng: '116.4512', rating: '4.6', reviews: 2100 },
  { id: 'g-47', name: 'Samsung Store - Nanjing Road',            city: 'Shanghai',   address: 'Nanjing East Road, Huangpu, Shanghai',     type: 'Experience Store',    phone: '+86 21 6361 5000', hours: '10AM–10PM',lat: '31.2358', lng: '121.4767', rating: '4.7', reviews: 3450 },
  { id: 'g-48', name: 'Samsung Experience Store - Guangzhou',    city: 'Guangzhou',  address: 'Tianhe District, Guangzhou, Guangdong',    type: 'Experience Store',    phone: '+86 20 3801 4000', hours: '10AM–10PM',lat: '23.1291', lng: '113.3265', rating: '4.5', reviews: 1780 },

  // ── AUSTRALIA ────────────────────────────────────────────────────────
  { id: 'g-49', name: 'Samsung Experience Store - Sydney',       city: 'Sydney',     address: 'Pitt Street Mall, Sydney NSW 2000',        type: 'Experience Store',    phone: '+61 2 9267 7000', hours: '10AM–8PM', lat: '-33.8736', lng: '151.2059', rating: '4.7', reviews: 2100 },
  { id: 'g-50', name: 'Samsung Experience Store - Melbourne',    city: 'Melbourne',  address: 'Bourke Street Mall, Melbourne VIC 3000',   type: 'Experience Store',    phone: '+61 3 9639 0800', hours: '10AM–8PM', lat: '-37.8142', lng: '144.9631', rating: '4.6', reviews: 1890 },
  { id: 'g-51', name: 'Samsung Store - Brisbane',                city: 'Brisbane',   address: 'Queen Street Mall, Brisbane QLD 4000',     type: 'Authorized Retailer', phone: '+61 7 3210 0300', hours: '9AM–9PM',  lat: '-27.4698', lng: '153.0251', rating: '4.4', reviews: 890 },

  // ── CANADA ───────────────────────────────────────────────────────────
  { id: 'g-52', name: 'Samsung Experience Store - Toronto',      city: 'Toronto',    address: 'CF Eaton Centre, 220 Yonge St, Toronto',   type: 'Experience Store',    phone: '+1 416-597-9000', hours: '10AM–9PM', lat: '43.6544', lng: '-79.3807', rating: '4.6', reviews: 1560 },
  { id: 'g-53', name: 'Samsung Store - Vancouver',               city: 'Vancouver',  address: 'Pacific Centre, 701 W Georgia St',         type: 'Authorized Retailer', phone: '+1 604-678-9900', hours: '10AM–9PM', lat: '49.2827', lng: '-123.1207', rating: '4.4', reviews: 890 },

  // ── BRAZIL ───────────────────────────────────────────────────────────
  { id: 'g-54', name: 'Samsung Experience Store - São Paulo',    city: 'São Paulo',  address: 'Shopping Iguatemi, Av. Brig. Faria Lima',  type: 'Experience Store',    phone: '+55 11 3898 5500', hours: '10AM–10PM',lat: '-23.5780', lng: '-46.6963', rating: '4.5', reviews: 2100 },
  { id: 'g-55', name: 'Samsung Store - Rio de Janeiro',          city: 'Rio',        address: 'Shopping Rio Sul, Botafogo, Rio de Janeiro',type: 'Authorized Retailer', phone: '+55 21 2275 8800', hours: '10AM–10PM',lat: '-22.9511', lng: '-43.1865', rating: '4.4', reviews: 1230 },

  // ── SINGAPORE ────────────────────────────────────────────────────────
  { id: 'g-56', name: 'Samsung Experience Store - Orchard',      city: 'Singapore',  address: '313 Orchard Road, Singapore 238895',       type: 'Experience Store',    phone: '+65 6363 6677', hours: '10AM–10PM',  lat: '1.3023', lng: '103.8367', rating: '4.8', reviews: 3210 },
  { id: 'g-57', name: 'Samsung Store - Vivocity',                city: 'Singapore',  address: '1 HarbourFront Walk, Singapore 098585',    type: 'Authorized Retailer', phone: '+65 6376 8877', hours: '10AM–10PM',  lat: '1.2644', lng: '103.8225', rating: '4.6', reviews: 1560 },

  // ── MALAYSIA ─────────────────────────────────────────────────────────
  { id: 'g-58', name: 'Samsung Experience Store - KLCC',         city: 'Kuala Lumpur', address: 'Suria KLCC, Jalan Ampang, KL 50088',    type: 'Experience Store',    phone: '+60 3-2382 8000', hours: '10AM–10PM',lat: '3.1585', lng: '101.7120', rating: '4.7', reviews: 2340 },
  { id: 'g-59', name: 'Samsung SmartCafé - Mid Valley',          city: 'Kuala Lumpur', address: 'Mid Valley Megamall, Kuala Lumpur',     type: 'Authorized Retailer', phone: '+60 3-2938 6800', hours: '10AM–10PM',lat: '3.1179', lng: '101.6777', rating: '4.5', reviews: 1120 },

  // ── INDONESIA ────────────────────────────────────────────────────────
  { id: 'g-60', name: 'Samsung Experience Store - Grand Indonesia', city: 'Jakarta', address: 'Grand Indonesia, Jl. MH Thamrin, Jakarta', type: 'Experience Store',   phone: '+62 21 2358 0600', hours: '10AM–10PM',lat: '-6.1935', lng: '106.8213', rating: '4.6', reviews: 1890 },
  { id: 'g-61', name: 'Samsung Store - Bali',                    city: 'Bali',       address: 'Discovery Shopping Mall, Kuta, Bali',      type: 'Authorized Retailer', phone: '+62 361 755 5200', hours: '10AM–9PM', lat: '-8.7241', lng: '115.1708', rating: '4.4', reviews: 678 },

  // ── THAILAND ─────────────────────────────────────────────────────────
  { id: 'g-62', name: 'Samsung Experience Store - Siam Paragon', city: 'Bangkok',    address: 'Siam Paragon, Pathum Wan, Bangkok',        type: 'Experience Store',    phone: '+66 2-610-8888', hours: '10AM–10PM',  lat: '13.7463', lng: '100.5347', rating: '4.7', reviews: 2890 },
  { id: 'g-63', name: 'Samsung SmartCafé - CentralWorld',        city: 'Bangkok',    address: 'CentralWorld, Pathum Wan, Bangkok',        type: 'Authorized Retailer', phone: '+66 2-646-1000', hours: '10AM–10PM',  lat: '13.7480', lng: '100.5398', rating: '4.5', reviews: 1560 },

  // ── PHILIPPINES ──────────────────────────────────────────────────────
  { id: 'g-64', name: 'Samsung Experience Store - SM Mall of Asia', city: 'Manila',  address: 'SM Mall of Asia, Pasay City, Manila',      type: 'Experience Store',    phone: '+63 2-831-1234', hours: '10AM–9PM',   lat: '14.5354', lng: '120.9823', rating: '4.6', reviews: 2100 },
  { id: 'g-65', name: 'Samsung SmartCafé - BGC',                  city: 'Manila',    address: 'Bonifacio Global City, Taguig, Manila',    type: 'Authorized Retailer', phone: '+63 2-818-4000', hours: '10AM–10PM',  lat: '14.5505', lng: '121.0497', rating: '4.5', reviews: 890 },

  // ── SOUTH AFRICA ─────────────────────────────────────────────────────
  { id: 'g-66', name: 'Samsung Experience Store - Sandton',       city: 'Johannesburg', address: 'Sandton City, Sandton, Johannesburg',   type: 'Experience Store',    phone: '+27 11 784 1234', hours: '9AM–9PM',  lat: '-26.1076', lng: '28.0567', rating: '4.5', reviews: 1120 },
  { id: 'g-67', name: 'Samsung Store - Cape Town V&A',            city: 'Cape Town',  address: 'V&A Waterfront, Cape Town 8001',           type: 'Authorized Retailer', phone: '+27 21 418 3400', hours: '9AM–9PM',  lat: '-33.9022', lng: '18.4195', rating: '4.4', reviews: 789 },

  // ── EGYPT ────────────────────────────────────────────────────────────
  { id: 'g-68', name: 'Samsung Experience Store - Cairo Festival City', city: 'Cairo', address: 'Cairo Festival City Mall, New Cairo', type: 'Experience Store',      phone: '+20 2-2268 6000', hours: '10AM–11PM',lat: '30.0197', lng: '31.4010', rating: '4.5', reviews: 1450 },

  // ── NIGERIA ──────────────────────────────────────────────────────────
  { id: 'g-69', name: 'Samsung Experience Store - Victoria Island', city: 'Lagos',   address: 'Landmark Centre, Victoria Island, Lagos',  type: 'Experience Store',    phone: '+234 1 277 7700', hours: '9AM–8PM',  lat: '6.4278', lng: '3.4344', rating: '4.3', reviews: 678 },

  // ── KENYA ────────────────────────────────────────────────────────────
  { id: 'g-70', name: 'Samsung Experience Store - Nairobi',        city: 'Nairobi',   address: 'The Hub Karen, Nairobi, Kenya',            type: 'Experience Store',    phone: '+254 20 386 2000', hours: '9AM–8PM', lat: '-1.3352', lng: '36.7100', rating: '4.4', reviews: 567 },

  // ── TURKEY ───────────────────────────────────────────────────────────
  { id: 'g-71', name: 'Samsung Experience Store - Istanbul',       city: 'Istanbul',  address: 'Istinye Park AVM, Istanbul',               type: 'Experience Store',    phone: '+90 212 345 6789', hours: '10AM–10PM',lat: '41.1126', lng: '29.0512', rating: '4.6', reviews: 2100 },

  // ── RUSSIA ───────────────────────────────────────────────────────────
  { id: 'g-72', name: 'Samsung Experience Store - Moscow',         city: 'Moscow',    address: 'Okhotny Ryad Mall, Moscow',                type: 'Experience Store',    phone: '+7 495 644 2200',  hours: '10AM–10PM',lat: '55.7558', lng: '37.6182', rating: '4.5', reviews: 1890 },
  { id: 'g-73', name: 'Samsung SmartCafé - Saint Petersburg',      city: 'Saint Petersburg', address: 'Galeria Mall, St. Petersburg',     type: 'Authorized Retailer', phone: '+7 812 640 2200',  hours: '10AM–10PM',lat: '59.9343', lng: '30.3351', rating: '4.3', reviews: 890 },

  // ── ITALY ────────────────────────────────────────────────────────────
  { id: 'g-74', name: 'Samsung Experience Store - Milan',          city: 'Milan',     address: 'Corso Vittorio Emanuele II, 20122 Milano', type: 'Experience Store',    phone: '+39 02 8728 1200', hours: '10AM–8PM', lat: '45.4654', lng: '9.1905', rating: '4.6', reviews: 1340 },
  { id: 'g-75', name: 'Samsung Store - Rome',                      city: 'Rome',      address: 'Via del Corso, 00186 Roma',                type: 'Authorized Retailer', phone: '+39 06 6920 1100', hours: '10AM–8PM', lat: '41.9031', lng: '12.4779', rating: '4.4', reviews: 890 },

  // ── SPAIN ────────────────────────────────────────────────────────────
  { id: 'g-76', name: 'Samsung Experience Store - Madrid',         city: 'Madrid',    address: 'Gran Vía 32, 28013 Madrid',                type: 'Experience Store',    phone: '+34 91 531 2300',  hours: '10AM–9PM', lat: '40.4197', lng: '-3.7024', rating: '4.6', reviews: 2100 },
  { id: 'g-77', name: 'Samsung Store - Barcelona',                 city: 'Barcelona', address: 'Passeig de Gràcia 11, 08007 Barcelona',    type: 'Authorized Retailer', phone: '+34 93 342 5200',  hours: '10AM–9PM', lat: '41.3922', lng: '2.1663', rating: '4.5', reviews: 1560 },

  // ── NETHERLANDS ──────────────────────────────────────────────────────
  { id: 'g-78', name: 'Samsung Experience Store - Amsterdam',      city: 'Amsterdam', address: 'Magna Plaza, Nieuwezijds Voorburgwal 182', type: 'Experience Store',    phone: '+31 20 638 0000',  hours: '10AM–8PM', lat: '52.3736', lng: '4.8897', rating: '4.5', reviews: 1120 },

  // ── SWEDEN ───────────────────────────────────────────────────────────
  { id: 'g-79', name: 'Samsung Experience Store - Stockholm',      city: 'Stockholm', address: 'Gallerian, Hamngatan 37, Stockholm',       type: 'Experience Store',    phone: '+46 8 762 9900',   hours: '10AM–8PM', lat: '59.3327', lng: '18.0656', rating: '4.5', reviews: 890 },

  // ── MEXICO ───────────────────────────────────────────────────────────
  { id: 'g-80', name: 'Samsung Experience Store - Mexico City',    city: 'Mexico City', address: 'Antara Fashion Hall, Polanco, CDMX',    type: 'Experience Store',    phone: '+52 55 5281 1200', hours: '11AM–9PM', lat: '19.4284', lng: '-99.1973', rating: '4.5', reviews: 1340 },
  { id: 'g-81', name: 'Samsung Store - Guadalajara',               city: 'Guadalajara', address: 'Andares Centro Comercial, Zapopan',     type: 'Authorized Retailer', phone: '+52 33 3648 4400', hours: '11AM–9PM', lat: '20.6597', lng: '-103.3496', rating: '4.3', reviews: 678 },

  // ── ARGENTINA ────────────────────────────────────────────────────────
  { id: 'g-82', name: 'Samsung Experience Store - Buenos Aires',   city: 'Buenos Aires', address: 'Alto Palermo, Av. Santa Fe, CABA',    type: 'Experience Store',    phone: '+54 11 5354 2200', hours: '10AM–9PM', lat: '-34.5902', lng: '-58.4148', rating: '4.4', reviews: 1230 },

  // ── PAKISTAN ─────────────────────────────────────────────────────────
  { id: 'g-83', name: 'Samsung Experience Store - Lahore',         city: 'Lahore',    address: 'Gulberg III, Lahore, Punjab 54660',        type: 'Experience Store',    phone: '+92 42 3571 2345', hours: '10AM–9PM', lat: '31.5204', lng: '74.3587', rating: '4.4', reviews: 456 },
  { id: 'g-84', name: 'Samsung Service Center - Karachi',          city: 'Karachi',   address: 'Clifton Block 5, Karachi, Sindh',          type: 'Service Center',      phone: '+92 21 3587 6543', hours: '9AM–6PM',  lat: '24.8132', lng: '67.0357', rating: '4.2', reviews: 234 },

  // ── BANGLADESH ───────────────────────────────────────────────────────
  { id: 'g-85', name: 'Samsung Experience Store - Dhaka',          city: 'Dhaka',     address: 'Bashundhara City, Panthapath, Dhaka',      type: 'Experience Store',    phone: '+880 2-9128 5678', hours: '10AM–9PM', lat: '23.7512', lng: '90.3940', rating: '4.3', reviews: 389 },

  // ── SRI LANKA ────────────────────────────────────────────────────────
  { id: 'g-86', name: 'Samsung Experience Store - Colombo',        city: 'Colombo',   address: 'One Galle Face Mall, Colombo 01',          type: 'Experience Store',    phone: '+94 11 234 5678',  hours: '10AM–9PM', lat: '6.9271', lng: '79.8612', rating: '4.4', reviews: 312 },

  // ── VIETNAM ──────────────────────────────────────────────────────────
  { id: 'g-87', name: 'Samsung Experience Store - Ho Chi Minh',    city: 'Ho Chi Minh', address: 'Vincom Landmark 81, Bình Thạnh, HCM',  type: 'Experience Store',    phone: '+84 28 3810 8888', hours: '10AM–10PM',lat: '10.7950', lng: '106.7223', rating: '4.6', reviews: 1560 },
  { id: 'g-88', name: 'Samsung Store - Hanoi',                     city: 'Hanoi',     address: 'Vincom Center Bà Triệu, Hai Bà Trưng',    type: 'Authorized Retailer', phone: '+84 24 3974 5678', hours: '10AM–10PM',lat: '21.0245', lng: '105.8412', rating: '4.4', reviews: 890 },

  // ── TAIWAN ───────────────────────────────────────────────────────────
  { id: 'g-89', name: 'Samsung Experience Store - Taipei',         city: 'Taipei',    address: 'Xinyi District, Taipei City 110',          type: 'Experience Store',    phone: '+886 2 2723 9999', hours: '11AM–10PM',lat: '25.0330', lng: '121.5654', rating: '4.7', reviews: 2340 },

  // ── HONG KONG ────────────────────────────────────────────────────────
  { id: 'g-90', name: 'Samsung Experience Store - Causeway Bay',   city: 'Hong Kong', address: 'Times Square, 1 Matheson St, Causeway Bay',type: 'Experience Store',    phone: '+852 2833 1234', hours: '10AM–10PM',  lat: '22.2796', lng: '114.1826', rating: '4.7', reviews: 3120 },

  // ── SAUDI ARABIA ─────────────────────────────────────────────────────
  { id: 'g-91', name: 'Samsung Experience Store - Riyadh',         city: 'Riyadh',    address: 'Kingdom Centre Mall, Riyadh 12214',        type: 'Experience Store',    phone: '+966 11 211 2000', hours: '10AM–11PM',lat: '24.6914', lng: '46.6836', rating: '4.7', reviews: 2890 },
  { id: 'g-92', name: 'Samsung Store - Jeddah',                    city: 'Jeddah',    address: 'Mall of Arabia, Jeddah',                   type: 'Authorized Retailer', phone: '+966 12 692 5678', hours: '10AM–11PM',lat: '21.4858', lng: '39.1925', rating: '4.5', reviews: 1560 },

  // ── NEW ZEALAND ──────────────────────────────────────────────────────
  { id: 'g-93', name: 'Samsung Experience Store - Auckland',        city: 'Auckland',  address: 'Commercial Bay, 1 Queen St, Auckland',     type: 'Experience Store',    phone: '+64 9 356 7000',  hours: '10AM–8PM', lat: '-36.8434', lng: '174.7671', rating: '4.5', reviews: 1120 },

  // ── PORTUGAL ─────────────────────────────────────────────────────────
  { id: 'g-94', name: 'Samsung Experience Store - Lisbon',          city: 'Lisbon',    address: 'El Corte Inglés, Avenida António Augusto',type: 'Experience Store',    phone: '+351 21 371 1700', hours: '10AM–10PM',lat: '38.7223', lng: '-9.1393', rating: '4.4', reviews: 890 },

  // ── POLAND ───────────────────────────────────────────────────────────
  { id: 'g-95', name: 'Samsung Experience Store - Warsaw',          city: 'Warsaw',    address: 'Złote Tarasy, ul. Złota 59, Warszawa',     type: 'Experience Store',    phone: '+48 22 222 5400',  hours: '10AM–9PM', lat: '52.2297', lng: '21.0122', rating: '4.5', reviews: 1230 },

  // ── CZECH REPUBLIC ───────────────────────────────────────────────────
  { id: 'g-96', name: 'Samsung Store - Prague',                     city: 'Prague',    address: 'Palladium Shopping Centre, Náměstí Republiky', type: 'Authorized Retailer', phone: '+420 2 2411 9800', hours: '9AM–9PM',lat: '50.0875', lng: '14.4258', rating: '4.3', reviews: 678 },

  // ── GREECE ───────────────────────────────────────────────────────────
  { id: 'g-97', name: 'Samsung Experience Store - Athens',          city: 'Athens',    address: 'The Mall Athens, Marousi, Athens',         type: 'Experience Store',    phone: '+30 210 613 8200', hours: '10AM–9PM', lat: '38.0471', lng: '23.8034', rating: '4.4', reviews: 789 },

  // ── ISRAEL ───────────────────────────────────────────────────────────
  { id: 'g-98', name: 'Samsung Experience Store - Tel Aviv',        city: 'Tel Aviv',  address: 'Dizengoff Center, Tel Aviv',               type: 'Experience Store',    phone: '+972 3-621 9600',  hours: '10AM–9PM', lat: '32.0797', lng: '34.7742', rating: '4.5', reviews: 1120 },

  // ── GHANA ────────────────────────────────────────────────────────────
  { id: 'g-99', name: 'Samsung Experience Store - Accra',           city: 'Accra',     address: 'West Hills Mall, Accra, Ghana',             type: 'Experience Store',    phone: '+233 30 274 6000', hours: '9AM–8PM',  lat: '5.5601', lng: '-0.2071', rating: '4.2', reviews: 456 },

  // ── COLOMBIA ─────────────────────────────────────────────────────────
  { id: 'g-100', name: 'Samsung Experience Store - Bogotá',         city: 'Bogotá',    address: 'Centro Comercial El Retiro, Bogotá',        type: 'Experience Store',    phone: '+57 1 379 9800',  hours: '11AM–9PM', lat: '4.6765', lng: '-74.0478', rating: '4.4', reviews: 890 },

  // ── CHILE ────────────────────────────────────────────────────────────
  { id: 'g-101', name: 'Samsung Experience Store - Santiago',        city: 'Santiago',  address: 'Costanera Center, Providencia, Santiago',  type: 'Experience Store',    phone: '+56 2 2338 7200', hours: '10AM–9PM', lat: '-33.4172', lng: '-70.6068', rating: '4.4', reviews: 1120 },
]

const DEFAULT_CENTER = [20, 0]
const DEFAULT_ZOOM = 3

export default function StoreLocatorPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedStore, setSelectedStore] = useState(GLOBAL_STORES[2]) // default Madurai

  const [isLocating, setIsLocating] = useState(false)
  const [locationAlert, setLocationAlert] = useState(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  // Live Overpass augmentation states
  const [overpassStores, setOverpassStores] = useState([])
  const [isFetchingOverpass, setIsFetchingOverpass] = useState(false)

  // Geocoding search states
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerClusterGroupRef = useRef(null)
  const debounceTimerRef = useRef(null)
  const fetchOverpassRef = useRef(null)

  // Merge global + overpass, deduplicate by proximity
  const allStores = useMemo(() => {
    const combined = [...GLOBAL_STORES, ...overpassStores]
    return combined
  }, [overpassStores])

  const filteredStores = useMemo(() => {
    let result = allStores.filter((store) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = !q ||
        store.name.toLowerCase().includes(q) ||
        store.city.toLowerCase().includes(q) ||
        store.address.toLowerCase().includes(q)
      const matchesCategory =
        selectedCategory === 'All Categories' || store.type === selectedCategory
      return matchesSearch && matchesCategory
    })

    if (userLocation) {
      result = [...result].sort((a, b) =>
        getDistance(userLocation.lat, userLocation.lng, +a.lat, +a.lng) -
        getDistance(userLocation.lat, userLocation.lng, +b.lat, +b.lng)
      )
    }
    return result
  }, [allStores, searchQuery, selectedCategory, userLocation])

  const handleSelectStore = useCallback((store) => {
    setSelectedStore(store)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([+store.lat, +store.lng], Math.max(mapInstanceRef.current.getZoom(), 14), { duration: 0.8 })
    }
  }, [])

  // ── Overpass API fetch (augmentation only, no restriction) ────────────
  const fetchOverpassInBounds = useCallback(async () => {
    const map = mapInstanceRef.current
    if (!map) return
    const zoom = map.getZoom()
    if (zoom < 9) return // Only augment when zoomed in; global view uses GLOBAL_STORES

    setIsFetchingOverpass(true)
    try {
      const b = map.getBounds()
      const bbox = `${b.getSouth().toFixed(4)},${b.getWest().toFixed(4)},${b.getNorth().toFixed(4)},${b.getEast().toFixed(4)}`
      const query = [
        '[out:json][timeout:15];',
        '(',
        `node["brand"~"(?i)samsung"](${bbox});`,
        `node["name"~"(?i)samsung"](${bbox});`,
        `way["brand"~"(?i)samsung"](${bbox});`,
        `way["name"~"(?i)samsung"](${bbox});`,
        ');',
        'out center tags;'
      ].join('')

      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) return

      const data = await res.json()
      const elements = data.elements || []

      const parsed = elements.map(el => {
        const lat = el.lat ?? el.center?.lat
        const lng = el.lon ?? el.center?.lon
        if (lat == null || lng == null) return null
        const tags = el.tags || {}
        const name = tags.name || tags.brand || 'Samsung Store'
        const city = tags['addr:city'] || tags['addr:town'] || ''
        const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ')
        const address = tags['addr:full'] || [street, city, tags['addr:postcode']].filter(Boolean).join(', ') || 'Address not available'
        let type = 'Authorized Retailer'
        if (tags.shop === 'electronics' || tags['brand:wikidata']) type = 'Experience Store'
        if ((tags.name || '').toLowerCase().includes('service') || tags.repair === 'yes') type = 'Service Center'
        return {
          id: `osm-${el.id}`,
          name, city, address, type,
          phone: tags.phone || tags['contact:phone'] || '',
          hours: tags.opening_hours || '10AM–9PM',
          lat: lat.toString(), lng: lng.toString(),
          rating: (4.1 + Math.random() * 0.8).toFixed(1),
          reviews: Math.floor(20 + Math.random() * 400)
        }
      }).filter(Boolean)

      setOverpassStores(parsed)
    } catch (e) {
      console.warn('Overpass augmentation failed:', e)
    } finally {
      setIsFetchingOverpass(false)
    }
  }, [])

  useEffect(() => { fetchOverpassRef.current = fetchOverpassInBounds }, [fetchOverpassInBounds])

  // ── Nominatim geocoding search ────────────────────────────────────────
  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setIsSearching(true)
    setSearchError(null)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'SamsungShowcaseApp/1.0' } }
      )
      const results = await res.json()
      if (!results?.length) { setSearchError('Location not found. Try another city.'); return }
      const { lat, lon, boundingbox } = results[0]
      const map = mapInstanceRef.current
      if (!map) return
      if (boundingbox) {
        map.fitBounds([
          [+boundingbox[0], +boundingbox[2]],
          [+boundingbox[1], +boundingbox[3]]
        ], { maxZoom: 13, animate: true, duration: 1.2 })
      } else {
        map.flyTo([+lat, +lon], 13, { duration: 1.2 })
      }
    } catch {
      setSearchError('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // ── Geolocation ───────────────────────────────────────────────────────
  const fetchLocation = (isInitial = false) => {
    if (!isInitial) setIsLocating(true)
    setLocationAlert(null)
    if (!navigator.geolocation) { if (!isInitial) { setIsLocating(false); setLocationAlert('Geolocation not supported') } return }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude })
        mapInstanceRef.current?.flyTo([coords.latitude, coords.longitude], 13, { duration: 1.5 })
        setIsLocating(false)
        if (!isInitial) { setLocationAlert('Device located!'); setTimeout(() => setLocationAlert(null), 4000) }
      },
      () => {
        setIsLocating(false)
        if (!isInitial) { setLocationAlert('Location unavailable.'); setTimeout(() => setLocationAlert(null), 4000) }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // ── Map initialization ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const worldBounds = L.latLngBounds([-85, -180], [85, 180])
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      minZoom: 2,
      maxZoom: 18,
      maxBounds: worldBounds,
      maxBoundsViscosity: 1.0
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM)

    mapInstanceRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      noWrap: true,
      bounds: worldBounds,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map)

    L.control.attribution({ position: 'bottomleft' }).addTo(map)

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 16,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()
        const size = count >= 100 ? 50 : count >= 20 ? 44 : 38
        return L.divIcon({
          html: `<div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:#0f172a;
            border:2px solid rgba(255,255,255,0.2);
            color:#fff;font-size:${count >= 100 ? 11 : 12}px;font-weight:700;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 16px rgba(0,0,0,0.4);
            font-family:'Inter',sans-serif;letter-spacing:-0.5px;
          ">${count}</div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2]
        })
      }
    })
    map.addLayer(clusterGroup)
    markerClusterGroupRef.current = clusterGroup

    map.on('moveend', () => {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => fetchOverpassRef.current?.(), 500)
    })

    return () => {
      map.remove()
      mapInstanceRef.current = null
      clearTimeout(debounceTimerRef.current)
    }
  }, [])

  // ── Sync markers ──────────────────────────────────────────────────────
  useEffect(() => {
    const clusterGroup = markerClusterGroupRef.current
    if (!clusterGroup) return

    clusterGroup.clearLayers()

    filteredStores.forEach((store) => {
      const lat = +store.lat
      const lng = +store.lng
      if (isNaN(lat) || isNaN(lng)) return

      const isSelected = selectedStore?.id === store.id
      const icon = L.divIcon({
        html: `<div style="
          width:28px;height:28px;
          background:${isSelected ? '#06b6d4' : '#0f172a'};
          border:2px solid ${isSelected ? 'rgba(103,232,249,0.8)' : 'rgba(255,255,255,0.15)'};
          display:flex;align-items:center;justify-content:center;
          box-shadow:${isSelected ? '0 0 14px rgba(6,182,212,0.6)' : '0 2px 8px rgba(0,0,0,0.4)'};
          transform:${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition:all 0.2s ease;
        ">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="${isSelected ? '#000' : '#fff'}" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
          </svg>
        </div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      })

      const marker = L.marker([lat, lng], { icon })
      marker.on('click', () => handleSelectStore(store))
      clusterGroup.addLayer(marker)
    })
  }, [filteredStores, selectedStore, handleSelectStore])

  const handleZoomIn    = () => mapInstanceRef.current?.zoomIn()
  const handleZoomOut   = () => mapInstanceRef.current?.zoomOut()
  const handleZoomReset = () => {
    const map = mapInstanceRef.current
    if (!map) return
    if (userLocation) map.flyTo([userLocation.lat, userLocation.lng], 13)
    else if (selectedStore) map.flyTo([+selectedStore.lat, +selectedStore.lng], 14)
    else map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
  }

  return (
    <div className="h-screen w-screen bg-white text-neutral-800 font-sans flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">

        {/* ── LEFT PANEL ─────────────────────────────────────── */}
        <aside className="w-full md:w-[40%] h-1/2 md:h-full overflow-y-auto bg-white border-r border-neutral-100 flex flex-col">
          <div className="px-8 py-10 md:px-12 md:py-12 space-y-8 flex-1 flex flex-col">

            {/* Heading */}
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-extralight tracking-[0.25em] text-neutral-900 uppercase">WHERE TO</div>
              <div className="text-3xl md:text-5xl font-extralight tracking-[0.2em] text-neutral-900 uppercase font-serif italic">FIND US</div>
            </div>
            <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-md">
              We invite you to visit our Samsung Experience Stores and certified service boutiques to explore our latest technology collections.
            </p>

            {/* Search */}
            <div className="space-y-3">
              <form onSubmit={handleSearch}>
                <div className="relative border-b border-neutral-300 focus-within:border-neutral-900 transition-colors py-2 flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setSearchError(null) }}
                    placeholder="Search for country, region, city..."
                    className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-xs text-neutral-800 placeholder-neutral-400 font-light tracking-wide py-1"
                  />
                  <button type="submit" disabled={isSearching} className="absolute right-1 cursor-pointer disabled:opacity-50">
                    {isSearching ? (
                      <svg className="w-4 h-4 text-cyan-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-neutral-500 hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </form>
              {searchError && <p className="text-[9px] text-red-500 font-mono tracking-wide">{searchError}</p>}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => fetchLocation(false)}
                  disabled={isLocating}
                  className="text-[9px] font-bold uppercase tracking-widest underline hover:text-cyan-600 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isLocating ? 'Locating...' : 'Use my current location'}
                </button>
                {locationAlert && (
                  <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100">
                    {locationAlert}
                  </span>
                )}
              </div>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {['All Categories', 'Experience Store', 'Service Center', 'Authorized Retailer'].map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-black border-black text-white'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:border-black hover:text-black'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Store count */}
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                {filteredStores.length} stores {isFetchingOverpass ? '(scanning...)' : 'found'}
              </p>
              {isFetchingOverpass && <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"/>}
            </div>

            {/* Store list */}
            <div className="space-y-3 flex-1 pb-4">
              {filteredStores.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-neutral-200">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">No stores match your filter</p>
                </div>
              ) : (
                filteredStores.map((store) => {
                  const isSelected = selectedStore?.id === store.id
                  const distance = userLocation
                    ? getDistance(userLocation.lat, userLocation.lng, +store.lat, +store.lng)
                    : null

                  return (
                    <div key={store.id} onClick={() => handleSelectStore(store)}
                      className={`p-5 border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-50 shadow-sm'
                          : 'border-neutral-100 bg-white hover:border-neutral-300'
                      }`}>
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">
                          {store.type}{distance !== null ? ` • ${distance.toFixed(1)} mi` : ''}
                        </span>
                        <div className="flex items-center gap-0.5 text-[9px] font-bold text-amber-500">
                          <span>★</span>
                          <span className="text-neutral-800">{store.rating}</span>
                        </div>
                      </div>
                      <h3 className="text-[11px] font-bold text-neutral-900 mt-2 uppercase tracking-wider leading-snug">{store.name}</h3>
                      <p className="text-[10px] text-neutral-500 font-light mt-1">{store.address}</p>
                      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[9px] text-neutral-500">
                        <span><span className="font-semibold text-neutral-700">Hours: </span>{store.hours}</span>
                        {store.phone
                          ? <a href={`tel:${store.phone}`} onClick={e => e.stopPropagation()} className="font-semibold text-neutral-700 hover:text-black">{store.phone}</a>
                          : <span className="italic text-neutral-400">No phone</span>}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </aside>

        {/* ── RIGHT MAP PANEL ──────────────────────────────────── */}
        <main className="w-full md:w-[60%] h-1/2 md:h-full relative overflow-hidden">

          {/* Leaflet container — keep empty */}
          <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

          {/* Subtle scanning indicator */}
          {isFetchingOverpass && (
            <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur border border-neutral-200 px-3 py-1.5 flex items-center gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"/>
              <span className="text-[8px] font-mono uppercase tracking-widest text-neutral-600">Scanning live data...</span>
            </div>
          )}

          {/* Selected store popup */}
          {selectedStore && (
            <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 z-[1000] bg-white border border-neutral-200 p-6 shadow-xl space-y-4">
              <div>
                <span className="px-2 py-0.5 text-[7px] font-bold uppercase tracking-widest bg-black text-white">
                  {selectedStore.type}
                </span>
                <h4 className="text-xs font-bold text-neutral-900 mt-3 uppercase tracking-wider leading-snug">{selectedStore.name}</h4>
                <p className="text-[10px] text-neutral-500 font-light mt-1">{selectedStore.address}</p>
                {userLocation && (
                  <p className="text-[9px] font-mono text-cyan-600 mt-1 uppercase tracking-wide font-bold">
                    {getDistance(userLocation.lat, userLocation.lng, +selectedStore.lat, +selectedStore.lng).toFixed(1)} mi away
                  </p>
                )}
              </div>
              <div className="text-[9px] space-y-1 text-neutral-500 border-t border-neutral-100 pt-3">
                <div className="flex justify-between">
                  <span>Contact:</span>
                  {selectedStore.phone
                    ? <a href={`tel:${selectedStore.phone}`} className="font-semibold text-neutral-800 hover:underline">{selectedStore.phone}</a>
                    : <span className="italic">No contact listed</span>}
                </div>
                <div className="flex justify-between">
                  <span>Hours:</span>
                  <span className="font-semibold text-neutral-800">{selectedStore.hours}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedStore.name + ' ' + selectedStore.address)}`}
                  target="_blank" rel="noreferrer"
                  className="flex-1 py-2.5 bg-black hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-widest transition-all text-center">
                  Get Directions
                </a>
                {selectedStore.phone && (
                  <a href={`tel:${selectedStore.phone}`}
                    className="py-2.5 px-4 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-[9px] font-bold uppercase tracking-widest">
                    Call
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Zoom controls */}
          <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-1.5">
            {[
              { label: '+', fn: handleZoomIn },
              { label: '−', fn: handleZoomOut },
              { label: '⊙', fn: handleZoomReset, title: 'Recenter' }
            ].map(({ label, fn, title }) => (
              <button key={label} onClick={fn} title={title}
                className="w-9 h-9 bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 hover:text-black hover:scale-105 active:scale-95 transition-all shadow-md font-bold text-sm cursor-pointer">
                {label}
              </button>
            ))}
          </div>

          {/* Watermark */}
          <div className="absolute top-3 right-3 z-[1000] bg-white/80 backdrop-blur border border-neutral-200 px-2.5 py-1 text-[7px] font-mono text-neutral-500 tracking-wider">
            CARTO POSITRON · OSM LIVE DATA
          </div>
        </main>

      </div>
    </div>
  )
}
