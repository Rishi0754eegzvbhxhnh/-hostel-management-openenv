/**
 * routes/tourism.js (Hyderabad Local Edition)
 * ============================================
 * Deep Hyderabad-local holiday planner:
 * - 60+ places across 8 categories
 * - Neighbourhoods / Areas
 * - Food streets & Irani chai spots
 * - Day trips from Hyderabad  
 * - Weekend vibe-based plan generator
 * - Gemini AI narrative for itineraries
 */
const express = require('express');
const router  = express.Router();
const aiService = require('../services/aiService');

// ╔══════════════════════════════════════════════════════════════╗
// ║              HYDERABAD LOCAL PLACES DATABASE                ║
// ╚══════════════════════════════════════════════════════════════╝
const HYD_PLACES = {
  historical: [
    {
      id: 'charminar', name: 'Charminar', area: 'Old City',
      desc: 'The iconic 16th-century mosque & monument — heart of Hyderabad.',
      rating: 4.8, cost: 25, duration_hrs: 2, distance_km: 0,
      timing: '9:00 AM – 5:30 PM', best_time: 'Early morning or evening',
      type: 'Historical', vibe: ['explorer', 'photography'],
      tips: ['Visit on weekdays to avoid crowds', 'Climb the minaret for panoramic views'],
      nearby: ['Laad Bazaar', 'Mecca Masjid', 'Shah Ghouse'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Charminar_2.jpg/480px-Charminar_2.jpg',
    },
    {
      id: 'golconda', name: 'Golconda Fort', area: 'Golconda',
      desc: 'Medieval diamond-trade fortress with stunning sound & light show at night.',
      rating: 4.7, cost: 15, duration_hrs: 3, distance_km: 11,
      timing: '8:00 AM – 5:30 PM | Light show: 6:30 PM',
      best_time: 'Weekday evenings for light show',
      type: 'Historical', vibe: ['explorer', 'photography', 'couples'],
      tips: ['Carry water — lots of climbing', 'Clap at the acoustic spot near main gate'],
      nearby: ['Qutb Shahi Tombs', 'Taramati Baradari'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Golconda_fort.jpg/480px-Golconda_fort.jpg',
    },
    {
      id: 'qutb-shahi', name: 'Qutb Shahi Tombs', area: 'Golconda',
      desc: 'Stunning necropolis of the Qutb Shahi dynasty — 7 royal tombs in beautiful gardens.',
      rating: 4.5, cost: 15, duration_hrs: 1.5, distance_km: 10,
      timing: '9:30 AM – 4:30 PM (Closed Friday)',
      best_time: 'Morning for best light',
      type: 'Historical', vibe: ['explorer', 'photography'],
      tips: ['Usually uncrowded — great for peaceful walks', 'Combined ticket with Golconda'],
      nearby: ['Golconda Fort', 'Heritage Foods Museum'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Qutb_Shahi_tombs.jpg/480px-Qutb_Shahi_tombs.jpg',
    },
    {
      id: 'paigah-tombs', name: 'Paigah Tombs', area: 'Santosh Nagar',
      desc: 'Hidden gem — exquisite 19th-century marble inlay tombs of the Paigah nobility. Underrated beauty.',
      rating: 4.3, cost: 0, duration_hrs: 1, distance_km: 4,
      timing: '9:00 AM – 5:00 PM',
      best_time: 'Anytime (rarely crowded)',
      type: 'Historical', vibe: ['explorer', 'photography'],
      tips: ['Almost no tourists — you may have it to yourself!', 'Stunning tilework — bring camera'],
      nearby: ['Purani Haveli', 'Nizam Museum'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Paigah_Tombs_Hyderabad.jpg/480px-Paigah_Tombs_Hyderabad.jpg',
    },
    {
      id: 'salar-jung', name: 'Salar Jung Museum', area: 'Dar-ul-Shifa',
      desc: 'Largest one-man collection of antiques in the world — don\'t miss the Veiled Rebecca & Musical Clock.',
      rating: 4.5, cost: 20, duration_hrs: 3, distance_km: 3,
      timing: '10:00 AM – 5:00 PM (Closed Friday)',
      best_time: 'Morning, weekdays',
      type: 'Historical', vibe: ['explorer', 'families'],
      tips: ['Musical Clock strikes at every hour — don\'t miss it', 'The jade collection is stunning'],
      nearby: ['Charminar', 'Purani Haveli'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Salar_Jung_Museum.jpg/480px-Salar_Jung_Museum.jpg',
    },
    {
      id: 'chowmahalla', name: 'Chowmahalla Palace', area: 'Old City',
      desc: 'Opulent palace of the Nizams — restored royal vintage car collection + stunning durbar hall.',
      rating: 4.6, cost: 80, duration_hrs: 2, distance_km: 3,
      timing: '10:00 AM – 5:00 PM (Closed Friday)',
      best_time: 'Morning',
      type: 'Historical', vibe: ['explorer', 'photography', 'couples'],
      tips: ['Vintage car collection is a highlight', 'Beautiful chandeliers in Khilwat Mubarak hall'],
      nearby: ['Charminar', 'Laad Bazaar'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Chowmahalla_Palace.jpg/480px-Chowmahalla_Palace.jpg',
    },
  ],

  nature: [
    {
      id: 'kbr-park', name: 'KBR National Park', area: 'Jubilee Hills',
      desc: '400-acre urban forest — morning walks with deer, monitor lizards, and peacocks.',
      rating: 4.6, cost: 0, duration_hrs: 2, distance_km: 9,
      timing: '5:30 AM – 9:30 AM | 3:00 PM – 6:30 PM',
      best_time: 'Early morning for wildlife',
      type: 'Nature', vibe: ['relaxation', 'morning-person', 'fitness'],
      tips: ['Morning is magical — deer come to the pathway', 'Follow forest-only trail for best experience'],
      nearby: ['Jubilee Hills Checkpost cafes'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/KBR_Park_Hyderabad.jpg/480px-KBR_Park_Hyderabad.jpg',
    },
    {
      id: 'durgam-cheruvu', name: 'Durgam Cheruvu', area: 'Jubilee Hills',
      desc: 'Secret lake hidden between rocky boulders — kayaking, rock climbing, and beautiful sunsets.',
      rating: 4.4, cost: 50, duration_hrs: 2.5, distance_km: 10,
      timing: '6:00 AM – 6:00 PM',
      best_time: 'Sunset (5:30 PM onwards)',
      type: 'Nature', vibe: ['couples', 'adventure', 'photography'],
      tips: ['Kayaking is ₹50–100', 'Rocky trails are great for short treks'],
      nearby: ['KBR Park', 'Jubilee Hills cafes'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Secret_Lake_Hyderabad.jpg/480px-Secret_Lake_Hyderabad.jpg',
    },
    {
      id: 'hussain-sagar', name: 'Hussain Sagar Lake', area: 'Tank Bund',
      desc: 'Giant heart-shaped lake with the iconic 18m Buddha statue — boat rides available.',
      rating: 4.3, cost: 60, duration_hrs: 2, distance_km: 3,
      timing: '8:00 AM – 9:00 PM',
      best_time: 'Evening for lights and boats',
      type: 'Nature', vibe: ['families', 'couples', 'relaxation'],
      tips: ['Boat to Buddha — ₹60 round trip', 'Necklace Road walk is free and beautiful at night'],
      nearby: ['Lumbini Park', 'NTR Gardens', 'Eat Street'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/HussainSagarLake.jpg/480px-HussainSagarLake.jpg',
    },
    {
      id: 'osman-sagar', name: 'Osman Sagar (Gandipet)', area: 'Gandipet',
      desc: 'Huge reservoir lake with picnic spots, fishing, and panoramic views. Perfect weekend escape.',
      rating: 4.2, cost: 20, duration_hrs: 3, distance_km: 24,
      timing: '6:00 AM – 7:00 PM',
      best_time: 'Weekday morning to avoid crowd',
      type: 'Nature', vibe: ['couples', 'families', 'relaxation'],
      tips: ['Carry your own food', 'Great for sunrise photography'],
      nearby: ['Himayat Sagar', 'Chilkur Balaji Temple'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Osman_Sagar_Lake.jpg/480px-Osman_Sagar_Lake.jpg',
    },
    {
      id: 'mrugavani', name: 'Mrugavani National Park', area: 'Chevella Road',
      desc: 'Silent forest reserve with a small lake, trekking trails, and rich birdlife. True urban escape.',
      rating: 4.4, cost: 15, duration_hrs: 3, distance_km: 25,
      timing: '7:00 AM – 5:30 PM (Closed Monday)',
      best_time: 'Early morning for birds',
      type: 'Nature', vibe: ['adventure', 'nature-lover', 'solo'],
      tips: ['Carry binoculars for bird watching', 'Trekking trail takes ~1 hour'],
      nearby: ['Chilkur Balaji Temple', 'Osman Sagar'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Mrugavani_National_Park.jpg/480px-Mrugavani_National_Park.jpg',
    },
  ],

  food: [
    {
      id: 'paradise-biryani', name: 'Paradise Biryani', area: 'Secunderabad',
      desc: 'THE original Hyderabadi Dum Biryani since 1953. The most iconic restaurant in the city.',
      rating: 4.7, cost: 220, duration_hrs: 1, distance_km: 8,
      timing: '11:00 AM – 11:30 PM',
      best_time: 'Lunch (lesser wait)',
      type: 'Food', vibe: ['foodie', 'must-do', 'groups'],
      tips: ['Order Chicken Dum Biryani + Mirchi ka Salan', 'Secunderabad branch has shorter queues'],
      nearby: ['Bawarchi', 'Shah Ghouse (Old City branch)'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Hyderabadi_dum_biryani.jpg/480px-Hyderabadi_dum_biryani.jpg',
    },
    {
      id: 'gokul-chat', name: 'Gokul Chat Bhandar', area: 'RTC X Roads',
      desc: 'Legendary street chat shop since 1952 — famous Papdi Chat and Dahi Bhalla. Always a queue.',
      rating: 4.8, cost: 60, duration_hrs: 0.5, distance_km: 5,
      timing: '11:00 AM – 10:30 PM',
      best_time: 'Evening for the full experience',
      type: 'Food', vibe: ['foodie', 'budget', 'street-food'],
      tips: ['Cash only — no UPI here', 'Try the Aloo Chaat and Cold Coffee too'],
      nearby: ['Eat Street', 'Pulla Reddy Sweets'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Chat_Bhandar_Hyderabad.jpg/480px-Chat_Bhandar_Hyderabad.jpg',
    },
    {
      id: 'irani-chai', name: 'Nimrah Café (Irani Chai)', area: 'Charminar',
      desc: 'The oldest Irani café next to Charminar — Osmania biscuits + Irani chai. ₹15 per cup!',
      rating: 4.7, cost: 30, duration_hrs: 0.5, distance_km: 0.2,
      timing: '5:30 AM – 10:00 PM',
      best_time: 'Early morning or after Charminar visit',
      type: 'Food', vibe: ['foodie', 'budget', 'street-food', 'must-do'],
      tips: ['Order: Chai + Osmania biscuits. That\'s it. Perfect.', 'Experience the Old City ambience'],
      nearby: ['Charminar', 'Laad Bazaar'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Irani_Chai_Hyderabad.jpg/480px-Irani_Chai_Hyderabad.jpg',
    },
    {
      id: 'eat-street', name: 'Eat Street (Necklace Road)', area: 'Necklace Road',
      desc: 'APTDC food court on the lakeside — 30+ stalls with snacks, meals, and lake views.',
      rating: 4.2, cost: 150, duration_hrs: 2, distance_km: 4,
      timing: '5:00 PM – 11:00 PM',
      best_time: 'Evening (post 6 PM)',
      type: 'Food', vibe: ['foodie', 'groups', 'families', 'couples'],
      tips: ['Try the biryani stall and the ice cream section', 'Sit by the lake side for views'],
      nearby: ['Hussain Sagar', 'Lumbini Park'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Eat_Street_Hyderabad.jpg/480px-Eat_Street_Hyderabad.jpg',
    },
    {
      id: 'bawarchi', name: 'Bawarchi Restaurant', area: 'RTC X Roads',
      desc: 'Legendary late-night biryani stop — serves until 2 AM. A Hyderabad institution.',
      rating: 4.5, cost: 180, duration_hrs: 1, distance_km: 5,
      timing: '11:00 AM – 2:00 AM',
      best_time: 'Late night after 11 PM',
      type: 'Food', vibe: ['foodie', 'late-night', 'groups'],
      tips: ['Go late night for minimal wait', 'Chicken Biryani is the order here'],
      nearby: ['Gokul Chat', 'RTC X Roads'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Hyderabadi_dum_biryani.jpg/480px-Hyderabadi_dum_biryani.jpg',
    },
    {
      id: 'laad-bazaar-food', name: 'Laad Bazaar Food Trail', area: 'Old City',
      desc: 'Street food paradise adjacent to Charminar — Haleem, Paya, Lukhmi, and Sheer Khurma.',
      rating: 4.6, cost: 100, duration_hrs: 2, distance_km: 0.2,
      timing: '10:00 AM – 9:00 PM',
      best_time: 'Afternoon after Charminar visit',
      type: 'Food', vibe: ['foodie', 'budget', 'street-food', 'explorer'],
      tips: ['Try Pista House Haleem (seasonal)', 'Lukhmi is a Hyderabadi samosa — don\'t miss it'],
      nearby: ['Charminar', 'Nimrah Café'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Laad_Bazar.jpg/480px-Laad_Bazar.jpg',
    },
  ],

  shopping: [
    {
      id: 'laad-bazaar', name: 'Laad Bazaar (Bangles)', area: 'Old City',
      desc: 'Famous bangle market since Nizam era — lacquer bangles, pearls, embroidered suits, and antiques.',
      rating: 4.5, cost: 0, duration_hrs: 2, distance_km: 0.2,
      timing: '10:00 AM – 8:00 PM (Closed Friday pm)',
      best_time: 'Weekday morning',
      type: 'Shopping', vibe: ['shopping', 'explorer', 'couples'],
      tips: ['Bargain hard — start at 40% of asking price', 'Best bangles from shops near Charminar'],
      nearby: ['Charminar', 'Nimrah Café', 'Mecca Masjid'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Laad_Bazar.jpg/480px-Laad_Bazar.jpg',
    },
    {
      id: 'begum-bazaar', name: 'Begum Bazaar', area: 'Old City',
      desc: 'The wholesale market of Hyderabad — clothes, electronics, groceries at rock-bottom prices.',
      rating: 4.1, cost: 0, duration_hrs: 2, distance_km: 3,
      timing: '10:00 AM – 8:00 PM',
      best_time: 'Morning (less crowded)',
      type: 'Shopping', vibe: ['shopping', 'budget'],
      tips: ['Strict bargaining culture', 'Good for wholesale fabric and spices'],
      nearby: ['Monda Market', 'Gulzar House'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Begum_Bazaar.jpg/480px-Begum_Bazaar.jpg',
    },
    {
      id: 'himayatnagar', name: 'Himayatnagar Market', area: 'Himayatnagar',
      desc: 'Hip street market for clothes, books, quirky gifts, and cafes. Student hotspot.',
      rating: 4.3, cost: 0, duration_hrs: 2, distance_km: 6,
      timing: '11:00 AM – 9:00 PM',
      best_time: 'Evening',
      type: 'Shopping', vibe: ['shopping', 'student', 'couples'],
      tips: ['Great book shops with second-hand novels', 'Multiple cafes for breaks'],
      nearby: ['Café Aromas', 'Lamakaan'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Himayatnagar.jpg/480px-Himayatnagar.jpg',
    },
  ],

  cafes: [
    {
      id: 'lamakaan', name: 'Lamakaan', area: 'Banjara Hills',
      desc: 'Hyderabad\'s most loved open cultural space — art, music, film screenings + great coffee.',
      rating: 4.6, cost: 80, duration_hrs: 2, distance_km: 9,
      timing: '9:00 AM – 10:30 PM',
      best_time: 'Evening for events',
      type: 'Cafe', vibe: ['relaxation', 'student', 'couples', 'solo'],
      tips: ['Check their event calendar — free screenings & talks', 'Try the filter coffee and dosas'],
      nearby: ['Another Café', 'Banjara Hills Road No.12'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Lamakaan_Hyderabad.jpg/480px-Lamakaan_Hyderabad.jpg',
    },
    {
      id: 'ohris', name: "Ohri's Café and Village", area: 'Necklace Road',
      desc: 'Iconic lakeside multi-cuisine restaurant with rooftop and outdoor seating.',
      rating: 4.2, cost: 300, duration_hrs: 2, distance_km: 4,
      timing: '12:00 PM – 11:00 PM',
      best_time: 'Sunset dinner',
      type: 'Cafe', vibe: ['couples', 'relaxation', 'groups'],
      tips: ['Rooftop seating has best lake views', 'Book ahead on weekends'],
      nearby: ['Eat Street', 'Hussain Sagar'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Necklace_Road_Hyderabad.jpg/480px-Necklace_Road_Hyderabad.jpg',
    },
    {
      id: 'shah-ghouse', name: 'Shah Ghouse Café', area: 'Tolichowki',
      desc: 'Famous 24/7 Hyderabadi café — best Haleem, Paya, and biryani at 3 AM.',
      rating: 4.5, cost: 150, duration_hrs: 1, distance_km: 12,
      timing: '24 Hours',
      best_time: 'Late night or early morning!',
      type: 'Cafe', vibe: ['foodie', 'late-night', 'student', 'groups'],
      tips: ['The 3 AM biryani is legendary', 'Also try their Paya and Nihari'],
      nearby: ['Tolichowki', 'Masab Tank'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Hyderabadi_dum_biryani.jpg/480px-Hyderabadi_dum_biryani.jpg',
    },
  ],

  dayTrips: [
    {
      id: 'warangal', name: 'Warangal Fort & Thousand Pillar Temple', area: 'Warangal',
      desc: '146km from Hyderabad — stunning Kakatiya dynasty fort ruins and intricate temple carvings.',
      rating: 4.6, cost: 300, duration_hrs: 10, distance_km: 146,
      timing: 'Day trip — leave by 6 AM',
      best_time: 'October to March',
      type: 'Day Trip', vibe: ['explorer', 'photography', 'history'],
      tips: ['Take TSRTC bus or drive', 'Visit both Fort and Thousand Pillar Temple', 'Bhadrakali Temple nearby'],
      transit: 'Bus ₹150 or drive — 2.5 hrs',
      nearby: ['Pakhal Lake', 'Eturnagaram Wildlife Sanctuary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Warangal_fort.jpg/480px-Warangal_fort.jpg',
    },
    {
      id: 'nagarjunakonda', name: 'Nagarjunakonda', area: 'Nagarjuna Sagar',
      desc: '150km away — ancient Buddhist city submerged in a dam reservoir, accessible only by boat.',
      rating: 4.5, cost: 400, duration_hrs: 12, distance_km: 150,
      timing: 'Day trip — leave by 5:30 AM | Last boat at 2 PM',
      best_time: 'November to February',
      type: 'Day Trip', vibe: ['explorer', 'history', 'photography', 'adventure'],
      tips: ['Take an early bus from Majestic Bus Stand', 'Boat ferry crosses the reservoir', 'Museum on the island is excellent'],
      transit: 'Bus ₹180 to Nagarjuna Sagar, then ₹120 ferry',
      nearby: ['Nagarjuna Sagar Dam', 'Ethipothala Waterfalls'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Nagarjunakonda.jpg/480px-Nagarjunakonda.jpg',
    },
    {
      id: 'bidar', name: 'Bidar Fort & Mahmud Gawan Madrasa', area: 'Bidar (Karnataka)',
      desc: '130km — medieval Deccan Sultanate capital with massive fort, ancient madrasa, and Bidriware crafts.',
      rating: 4.4, cost: 350, duration_hrs: 10, distance_km: 130,
      timing: 'Day trip — leave by 6 AM',
      best_time: 'October to March',
      type: 'Day Trip', vibe: ['explorer', 'history', 'photography'],
      tips: ['Buy Bidriware (silver inlay craft) as souvenir', 'The fort is massive — comfortable shoes'],
      transit: 'KSRTC bus from Jubilee Bus Stand ~2.5 hrs, ₹120',
      nearby: ['Nanak Jhira Gurudwara', 'Basavakalyan'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Bidar_Fort.jpg/480px-Bidar_Fort.jpg',
    },
    {
      id: 'ananthagiri', name: 'Ananthagiri Hills', area: 'Vikarabad',
      desc: '80km from Hyderabad — coffee estates, trekking trails, waterfalls, and cool forest climate.',
      rating: 4.5, cost: 200, duration_hrs: 8, distance_km: 80,
      timing: 'Day trip — leave by 7 AM',
      best_time: 'Monsoon & post-monsoon (July–November)',
      type: 'Day Trip', vibe: ['adventure', 'nature-lover', 'couples', 'trekking'],
      tips: ['Trek to the viewpoint for stunning valley views', 'Bogatha Waterfalls nearby during monsoon'],
      transit: 'Drive ~1.5 hrs or bus from Jubilee Bus Stand',
      nearby: ['Vikarabad', 'Kotepally Reservoir'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Ananthagiri_Hills.jpg/480px-Ananthagiri_Hills.jpg',
    },
    {
      id: 'kuntala-falls', name: 'Kuntala Waterfalls', area: 'Adilabad',
      desc: '300km — tallest waterfall in Telangana (147ft). Worth the drive during monsoon.',
      rating: 4.7, cost: 500, duration_hrs: 14, distance_km: 300,
      timing: 'Overnight or early-morning day trip',
      best_time: 'July to October (monsoon)',
      type: 'Day Trip', vibe: ['adventure', 'nature-lover', 'groups', 'photography'],
      tips: ['Go during monsoon for full flow', 'Cave nearby is an added attraction'],
      transit: 'Drive ~5 hrs or TSRTC via Nirmal',
      nearby: ['Pochera Waterfall', 'Pembi Falls'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Kuntala_Waterfalls.jpg/480px-Kuntala_Waterfalls.jpg',
    },
  ],

  hidden: [
    {
      id: 'chilkur', name: 'Chilkur Balaji Temple', area: 'Chilkur',
      desc: '"Visa Temple" — no hundi, no prasad shop. Pure spiritual tradition. 100,000 devotees on weekends.',
      rating: 4.7, cost: 0, duration_hrs: 1.5, distance_km: 22,
      timing: '5:30 AM – 12:00 PM | 4:00 PM – 8:30 PM',
      best_time: 'Weekday morning for peace',
      type: 'Spiritual', vibe: ['spiritual', 'relaxation'],
      tips: ['Walk 11 pradakshinas (rounds) after darshan — tradition', 'Very peaceful on weekday mornings'],
      nearby: ['Osman Sagar', 'Gandipet Lake'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Chilkur_Balaji_Temple.jpg/480px-Chilkur_Balaji_Temple.jpg',
    },
    {
      id: 'moula-ali', name: 'Moula Ali Dargah Hill', area: 'Moula Ali',
      desc: 'Hidden hilltop dargah in east Hyderabad — panoramic 360° city views. Almost no tourists.',
      rating: 4.4, cost: 0, duration_hrs: 1.5, distance_km: 15,
      timing: '6:00 AM – 8:00 PM',
      best_time: 'Sunrise or sunset',
      type: 'Spiritual', vibe: ['spiritual', 'photography', 'solo'],
      tips: ['Climb 200+ steps — worth every step', 'Best view of HITEC City skyline from here'],
      nearby: ['Malkajgiri', 'Uppal'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Moula_Ali_Dargah.jpg/480px-Moula_Ali_Dargah.jpg',
    },
    {
      id: 'necklace-road', name: 'Necklace Road Night Walk', area: 'Tank Bund',
      desc: 'The best free evening activity in Hyderabad — 3km lakeside walk, light shows, and ice cream.',
      rating: 4.6, cost: 0, duration_hrs: 2, distance_km: 4,
      timing: '5:00 PM – 11:00 PM',
      best_time: 'Post-sunset (7 PM onwards)',
      type: 'Hidden', vibe: ['couples', 'relaxation', 'budget', 'solo'],
      tips: ['The NTR Garden light fountain show is ₹20', 'Sangeeth ice cream nearby is a must'],
      nearby: ['Hussain Sagar', 'Eat Street', 'Ohri\'s'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Necklace_Road_Hyderabad.jpg/480px-Necklace_Road_Hyderabad.jpg',
    },
    {
      id: 'sudha-cars', name: 'Sudha Cars Museum', area: 'Bahadurpura',
      desc: 'Guinness World Record museum — unique cars shaped like a football, biryani bowl, sofa, and more!',
      rating: 4.5, cost: 60, duration_hrs: 1, distance_km: 4,
      timing: '9:30 AM – 6:30 PM',
      best_time: 'Anytime — always fun',
      type: 'Hidden', vibe: ['families', 'photography', 'quirky'],
      tips: ['Most visited car museum in South India', 'The biryani-bowl car is the most photographed'],
      nearby: ['Charminar', 'Salar Jung Museum'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Sudha_car_museum.jpg/480px-Sudha_car_museum.jpg',
    },
  ],

  entertainment: [
    {
      id: 'ramoji', name: 'Ramoji Film City', area: 'Hayathnagar',
      desc: "World's largest film studio complex. 1600+ acres — theme parks, film sets, and live shows.",
      rating: 4.5, cost: 1150, duration_hrs: 10, distance_km: 30,
      timing: '9:00 AM – 5:30 PM',
      best_time: 'Weekdays (less crowd)',
      type: 'Entertainment', vibe: ['families', 'groups', 'must-do'],
      tips: ['Book online for 15% discount', 'The evening show tickets are extra', 'Wear comfortable shoes — massive campus'],
      nearby: ['MGM Dizzee World', 'Pochampally'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Ramoji_Film_City.jpg/480px-Ramoji_Film_City.jpg',
    },
    {
      id: 'snow-world', name: 'Snow World', area: 'Lower Tank Bund',
      desc: 'South Asia\'s largest theme-based snow park — real snow, snowfall, ice slide and -5°C temperature.',
      rating: 4.0, cost: 650, duration_hrs: 3, distance_km: 3,
      timing: '11:00 AM – 9:00 PM',
      best_time: 'Weekday afternoon',
      type: 'Entertainment', vibe: ['families', 'groups', 'couples'],
      tips: ['Rent jacket inside (₹50) to stay warm', 'Ideal for summer — it\'s blissfully cold!'],
      nearby: ['Hussain Sagar', 'NTR Gardens', 'Lumbini Park'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/s/snowworld.jpg/480px-snowworld.jpg',
    },
  ],
};

// Flatten all places
const ALL_PLACES = Object.values(HYD_PLACES).flat();

// ── GET /api/tourism/hyderabad ── All places with optional filters ────────────
router.get('/hyderabad', (req, res) => {
  const { category, vibe, budget, area } = req.query;
  let places = [...ALL_PLACES];

  if (category && category !== 'all') {
    const map = { historical: HYD_PLACES.historical, nature: HYD_PLACES.nature, food: HYD_PLACES.food, shopping: HYD_PLACES.shopping, cafes: HYD_PLACES.cafes, dayTrips: HYD_PLACES.dayTrips, hidden: HYD_PLACES.hidden, entertainment: HYD_PLACES.entertainment };
    places = map[category] || places;
  }
  if (vibe && vibe !== 'all') places = places.filter(p => p.vibe?.includes(vibe));
  if (budget) places = places.filter(p => p.cost <= parseInt(budget));
  if (area) places = places.filter(p => p.area.toLowerCase().includes(area.toLowerCase()));

  res.json({ success: true, city: 'Hyderabad', total: places.length, places });
});

// ── GET /api/tourism/hyderabad/areas ── All unique areas ─────────────────────
router.get('/hyderabad/areas', (req, res) => {
  const areas = [...new Set(ALL_PLACES.map(p => p.area))].sort();
  res.json({ success: true, areas });
});

// ── POST /api/tourism/hyderabad/weekend-plan ── AI-powered weekend planner ───
router.post('/hyderabad/weekend-plan', async (req, res) => {
  const { vibe = 'explorer', budget = 500, days = 1, studentName = 'Student' } = req.body;

  // Filter by vibe and budget
  let pool = ALL_PLACES.filter(p =>
    p.vibe?.includes(vibe) &&
    p.cost <= (budget / days) &&
    p.type !== 'Day Trip'
  ).sort((a, b) => b.rating - a.rating);

  // Select 3 places per day → morning, afternoon, evening
  const slots = ['morning', 'afternoon', 'evening'];
  const itinerary = [];
  let totalCost   = 0;

  for (let d = 0; d < days; d++) {
    const dayPlaces = pool.slice(d * 3, d * 3 + 3);
    const dayCost   = dayPlaces.reduce((s, p) => s + (p.cost || 0), 0) + (vibe === 'foodie' ? 150 : 100);
    totalCost      += dayCost;

    const [morning, afternoon, evening] = dayPlaces;
    itinerary.push({
      day: d + 1,
      morning:   morning   ? { name: morning.name,   area: morning.area,   cost: morning.cost,   duration: morning.duration_hrs,   desc: morning.desc,   tip: morning.tips?.[0]   } : null,
      afternoon: afternoon ? { name: afternoon.name, area: afternoon.area, cost: afternoon.cost, duration: afternoon.duration_hrs, desc: afternoon.desc, tip: afternoon.tips?.[0] } : null,
      evening:   evening   ? { name: evening.name,   area: evening.area,   cost: evening.cost,   duration: evening.duration_hrs,   desc: evening.desc,   tip: evening.tips?.[0]   } : null,
      travel_tip: `Use Ola/Uber — average ₹${50 + d * 10} between stops`,
      estimatedCost: dayCost,
    });
  }

  // AI narrative
  let aiNarrative = null;
  try {
    const placeNames = itinerary.flatMap(d => [d.morning?.name, d.afternoon?.name, d.evening?.name]).filter(Boolean);
    const prompt = `Write a short, exciting 2-3 sentence travel blurb for a hostel student going on a ${days}-day ${vibe} trip in Hyderabad on a ₹${budget} budget. They'll visit: ${placeNames.join(', ')}. Be enthusiastic, local, and relatable for a college student. Max 50 words.`;
    const result = await aiService.generateChatResponse(prompt, {}, '');
    aiNarrative = result?.answer || null;
  } catch {
    aiNarrative = `Perfect ${vibe} day in Hyderabad awaits! ${pool[0]?.name ? `Start at ${pool[0].name}` : 'Explore the city'} and discover the real Hyderabad that most tourists miss — all within your ₹${budget} budget. Let's go!`;
  }

  const transit_tips = [
    'Ola/Uber: ₹50–150 per ride within city',
    'Metro: Available — L-Amba to MGBS covers Old City',
    'Auto: ₹30–80 for short distances — always meters first',
    'Best times: Avoid 8–10 AM and 5–8 PM traffic',
  ];

  res.json({
    success: true,
    city: 'Hyderabad',
    vibe, days, budget, studentName,
    aiNarrative,
    itinerary,
    selectedPlaces: pool.slice(0, days * 3),
    summary: {
      estimatedCost: Math.min(totalCost, budget),
      savings: Math.max(0, budget - totalCost),
      placesCount: pool.slice(0, days * 3).length,
    },
    transit_tips,
  });
});

// ── Legacy multi-city endpoints (kept for backward compat) ───────────────────
const CITY_FALLBACK = { hyderabad: HYD_PLACES.historical.concat(HYD_PLACES.nature) };
router.get('/places', (req, res) => {
  const { city = 'hyderabad' } = req.query;
  const places = CITY_FALLBACK[city.toLowerCase()] || HYD_PLACES.historical;
  res.json({ success: true, city, places });
});
router.post('/holiday-plan', async (req, res) => {
  req.body.city = 'hyderabad';
  res.redirect(307, '/api/tourism/hyderabad/weekend-plan');
});
router.get('/cities', (req, res) => {
  res.json({ success: true, cities: [{ id: 'hyderabad', name: 'Hyderabad', placesCount: ALL_PLACES.length }] });
});

module.exports = router;
