import { Movie } from '../types/game';

// 1. Raw Lists from User Requirement
const RAW_90S_MOVIES = [
  "Jagadeka Veerudu Athiloka Sundari",
  "Bobbili Raja",
  "Kondaveeti Donga",
  "Kodama Simham",
  "Karthavyam",
  "Nari Nari Naduma Murari",
  "Alludugaru",
  "Shatruvu",
  "Gang Leader",
  "Aditya 369",
  "Rowdy Alludu",
  "Stuartpuram Police Station",
  "Surya IPS",
  "Seetharamaiah Gari Manavaralu",
  "Assembly Rowdy",
  "Chanti",
  "Gharana Mogudu",
  "Aapadbandhavudu",
  "President Gari Pellam",
  "Jamba Lakidi Pamba",
  "Sundarakanda",
  "Detective Narada",
  "Money",
  "Gaayam",
  "Major Chandrakanth",
  "Rajendrudu Gajendrudu",
  "Mr. Pellam",
  "Allari Priyudu",
  "Mutha Mestri",
  "Bangaru Kutumbam",
  "Hello Brother",
  "Bhairava Dweepam",
  "Subhalagnam",
  "Yamaleela",
  "Criminal",
  "Number One",
  "Peddarayudu",
  "Sisindri",
  "Ghatotkachudu",
  "Ammoru",
  "Gulabi",
  "Maavichiguru",
  "Pelli Sandadi",
  "Vinodam",
  "Ninne Pelladatha",
  "Akkada Ammayi Ikkada Abbayi",
  "Little Soldiers",
  "Annamayya",
  "Hitler",
  "Master",
  "Preminchukundam Raa",
  "Egire Paavurama",
  "Osey Ramulamma",
  "Sindhooram",
  "Choodalani Vundi",
  "Tholi Prema",
  "Bavagaru Bagunnara",
  "Ganesh",
  "Anthapuram",
  "Manoharam",
  "Raja",
  "Samarasimha Reddy",
  "Sneham Kosam",
  "Swayamvaram",
  "Devi",
  "Ravoyi Chandamama",
  "Sultan",
  "Premante Idera",
  "Harischandraa",
  "Postman",
  "Pelli Peetalu",
  "Ammo! Okato Tareekhu",
  "Subhakankshalu",
  "Aahvaanam",
  "W/o V. Vara Prasad",
  "Maa Nannaku Pelli",
  "Kalisundam Raa",
  "Nuvvu Vastavani",
  "Nuvve Kavali",
  "Annayya",
  "Badri",
  "Chitram",
  "Jayam Manadera",
  "Azad",
  "Vamsi",
  "Ninne Premistha",
  "College",
  "Pelli Chesukundam",
  "Intlo Illalu Vantintlo Priyuralu",
  "Pelli",
  "Family Circus",
  "Subha Sankalpam",
  "Mayalodu",
  "April 1 Vidudala",
  "Pelli Pustakam",
  "Ankuram",
  "Mathru Devo Bhava",
  "Aswani",
  "Money Money",
  "Vajram",
  "Kshana Kshanam",
  "Appula Appa Rao",
  "Edurinti Mogudu Pakkinti Pellam",
  "Bamma Maata Bangaru Baata",
  "Chitram Bhalare Vichitram",
  "Aa Okkati Adakku",
  "Mayalodu",
  "Madam",
  "Rajendrudu Gajendrudu",
  "Pekata Paparao",
  "Brundavanam",
  "Golmaal Govindam",
  "Lorry Driver",
  "Prema Khaidi",
  "Coolie No. 1",
  "Pedarayudu",
  "Rikshavodu",
  "Pokiri Raja",
  "Dharma Chakram",
  "Sarada Bullodu",
  "Pelli Kanuka",
  "Muddula Priyudu",
  "Mugguru Monagallu",
  "Allari Mogudu",
  "Mechanic Alludu",
  "Bangaru Bullodu",
  "Top Hero",
  "Super Police",
  "Gharana Bullodu",
  "Vajram",
  "Pavitra Bandham",
  "Pelli Chesukundam",
  "Intlo Illalu Vantintlo Priyuralu",
  "Ganesh",
  "Preyasi Raave",
  "Premaku Velayera",
  "Priyaraagalu",
  "Maa Annayya",
  "Seenu",
  "Samarasimha Reddy",
  "Sultan",
  "Raja Kumarudu",
  "Krishna Babu",
  "Yamajaathakudu",
  "Kanyadanam",
  "Manasichi Choodu",
  "Oke Okkadu (Telugu version)",
  "Iddaru Mitrulu",
  "Pilla Nachindi",
  "Maa Balaji",
  "Rajahamsa",
  "Ayanaki Iddaru",
  "Subhamastu",
  "Priyamaina Srivaaru",
  "Chilakkottudu",
  "Peddannayya",
  "Bobbili Simham",
  "Rowdy Inspector",
  "Lankeswarudu",
  "Muddula Menalludu",
  "Assembly Rowdy Mogudu",
  "Mamagaru",
  "Allari Alludu",
  "Nippu Ravva",
  "Bangaru Mogudu",
  "Allari Premikudu",
  "Peddarikam",
  "Pellam Chebite Vinali",
  "Maa Aayana Bangaram",
  "Akkum Bakkum",
  "Subhakankshalu",
  "Deergha Sumangali Bhava",
  "Pelli Pandiri",
  "Maa Pelliki Randi",
  "Gokulamlo Seeta",
  "Egire Paavurama",
  "Aahvaanam",
  "Chandralekha",
  "Suswagatham",
  "Thammudu",
  "Premaku Velayera",
  "College Bullodu",
  "Chala Bagundi",
  "Choosoddaam Randi",
  "Suryavamsam",
  "Neti Gandhi",
  "Police Brothers",
  "Bharathamlo Arjunudu",
  "Erra Mandaram",
  "Ankusham",
  "Ankuram",
  "Mathru Devo Bhava",
  "Repati Pourulu",
  "Osey Ramulamma",
  "Ladies Special",
  "Ammayi Kapuram",
  "Pavithra",
  "Shubha Muhurtham",
  "Family Circus",
  "W/o V. Vara Prasad",
  "Balarama Krishnulu",
  "Allari Priyudu",
  "Abbayigaru",
  "Akka Mogudu",
  "Muddula Mogudu",
  "Chinarayudu",
  "Aswamedham",
  "Bangaru Mogudu",
  "Nippu Ravva",
  "Major Chandrakanth",
  "Palnati Pourusham",
  "Mavichiguru",
  "Telugammayi",
  "Aame",
  "Dear Brother",
  "Ammayi Kapuram",
  "Pelli Koduku",
  "Shubhalekhalu",
  "Pokiri Raja",
  "Akkada Abbai Ikkada Ammayi",
  "Veedevadandi Babu",
  "Ugadi",
  "Kurralla Rajyam",
  "Oka Chinna Maata",
  "Vinodham",
  "Priyaragalu",
  "Dongaata",
  "Rambantu",
  "Little Soldiers",
  "Intlo Illalu Vantintlo Priyuralu",
  "Pelli Pandiri",
  "Maa Nannaki Pelli",
  "Chinnabbayi",
  "Chilakkottudu",
  "Veede",
  "Aahwanam",
  "Gokulamlo Seetha",
  "Hitler",
  "Suswagatham",
  "Preminchukundam Raa",
  "Bavagaru Bagunnara",
  "Raja",
  "Premante Idera",
  "Manasichi Choodu",
  "Kanyadanam",
  "Sultan",
  "Ravoyi Chandamama",
  "Suryudu",
  "Samarasimha Reddy",
  "Sneham Kosam",
  "Raja Kumarudu",
  "Seenu",
  "Krishna Babu",
  "Pilla Nachindi",
  "Iddaru Mitrulu",
  "Oke Okkadu",
  "Thammudu",
  "Preyasi Raave",
  "Manoharam",
  "Maa Balaji",
  "Annayya",
  "Kalisundam Raa",
  "Nuvvu Vastavani",
  "Badri",
  "Chitram",
  "Ninne Premistha",
  "Jayam Manadera",
  "Azad",
  "Vamsi",
  "Devi Putrudu",
  "Ammo! Okato Tareekhu",
  "Postman",
  "Harischandraa",
  "Family Circus",
  "Pelli Peetalu",
  "Deergha Sumangali Bhava",
  "Maa Aavida Collector",
  "Maavidakulu",
  "Soggadi Pellam",
  "Subha Sankalpam",
  "Pelli Pustakam",
  "April 1 Vidudala",
  "Ankuram",
  "Mathru Devo Bhava",
  "Money",
  "Money Money",
  "Appula Appa Rao",
  "Aa Okkati Adakku",
  "Chitram Bhalare Vichitram",
  "Edurinti Mogudu Pakkinti Pellam",
  "Bamma Maata Bangaru Baata",
  "Brundavanam",
  "Golmaal Govindam",
  "Madam",
  "Mayalodu",
  "Rajendrudu Gajendrudu",
  "Pekata Paparao",
  "Jamba Lakidi Pamba",
  "Mr. Pellam",
  "Kshana Kshanam"
];

const RAW_2000S_MOVIES = [
  "Nuvve Kavali",
  "Kalisundam Raa",
  "Annayya",
  "Badri",
  "Jayam Manadera",
  "Nuvvu Vastavani",
  "Chitram",
  "Devullu",
  "Murari",
  "Nuvvu Naaku Nachav",
  "Manasantha Nuvve",
  "Nuvvu Nenu",
  "Student No. 1",
  "Aadi",
  "Indra",
  "Jayam",
  "Manmadhudu",
  "Santosham",
  "Idiot",
  "Amma Nanna O Tamila Ammayi",
  "Okkadu",
  "Simhadri",
  "Tagore",
  "Arya",
  "Varsham",
  "Sye",
  "Anand",
  "Shankar Dada MBBS",
  "Athadu",
  "Nuvvostanante Nenoddantana",
  "Chatrapathi",
  "Bhadra",
  "Bunny",
  "Pokiri",
  "Bommarillu",
  "Godavari",
  "Vikramarkudu",
  "Happy Days",
  "Desamuduru",
  "Dubai Seenu",
  "Lakshyam",
  "Yamadonga",
  "Tulasi",
  "Jalsa",
  "Ready",
  "Parugu",
  "Gamyam",
  "King",
  "Neninthe",
  "Konchem Ishtam Konchem Kashtam",
  "Arundhati",
  "Kick",
  "Magadheera",
  "Arya 2",
  "Baanam",
  "Leader",
  "Ye Maaya Chesave",
  "Vedam",
  "Maryada Ramanna",
  "Adhurs",
  "Khaleja",
  "Brindavanam",
  "Ala Modalaindi",
  "100% Love",
  "Dookudu",
  "Mr. Perfect",
  "Oosaravelli",
  "Eega",
  "Gabbar Singh",
  "Julayi",
  "Ishq",
  "Businessman",
  "Seethamma Vakitlo Sirimalle Chettu",
  "Attarintiki Daredi",
  "Mirchi",
  "Uyyala Jampala",
  "Manam",
  "Race Gurram",
  "1 Nenokkadine",
  "Run Raja Run",
  "Loukyam",
  "Temper",
  "Baahubali: The Beginning",
  "Srimanthudu",
  "Bhale Bhale Magadivoy",
  "Kanche",
  "Soggade Chinni Nayana",
  "Oopiri",
  "Pelli Choopulu",
  "Dhruva",
  "Janatha Garage",
  "Nenu Local",
  "Baahubali 2: The Conclusion",
  "Fidaa",
  "Arjun Reddy",
  "Mahanati",
  "Rangasthalam",
  "Bharat Ane Nenu",
  "Chi La Sow",
  "RX 100",
  "Geetha Govindam",
  "Goodachari",
  "Sammohanam",
  "Ee Nagaraniki Emaindhi",
  "Tholi Prema",
  "Needi Naadi Oke Katha",
  "Awe!",
  "Chalo",
  "Hello",
  "MCA",
  "Ninnu Kori",
  "Jai Lava Kusa",
  "Spyder",
  "Kotha Bangaru Lokam",
  "Blade Babji",
  "Current",
  "Prasthanam",
  "Ganesh",
  "Darling",
  "Orange",
  "Golconda High School",
  "Rajanna",
  "Panjaa",
  "Bodyguard",
  "Racha",
  "Rebel",
  "Krishnam Vande Jagadgurum",
  "Naayak",
  "Balupu",
  "Ramayya Vasthavayya",
  "Legend",
  "Heart Attack",
  "Mukunda",
  "Gopala Gopala",
  "Yevade Subramanyam",
  "Jil",
  "Subramanyam For Sale",
  "Akhil",
  "Bengal Tiger",
  "Express Raja",
  "Krishnagadi Veera Prema Gaadha",
  "Supreme",
  "Gentleman",
  "Ekkadiki Pothavu Chinnavada",
  "Khaidi No. 150",
  "Guru",
  "Rarandoi Veduka Chudham",
  "Shatamanam Bhavati",
  "Raja The Great",
  "Keshava",
  "LIE",
  "Okka Kshanam",
  "Aadavari Matalaku Ardhalu Verule",
  "Allari Bullodu",
  "Andarivaadu",
  "Annavaram",
  "Ashok",
  "Boss",
  "Chandamama",
  "Chirutha",
  "Devadasu",
  "Dhee",
  "Dongala Mutha",
  "Ganesh Just Ganesh",
  "Kantri",
  "Krishna",
  "Madhumasam",
  "Mass",
  "Munna",
  "Operation Duryodhana",
  "Pellaina Kothalo",
  "Pourudu",
  "Shock",
  "Sivamani",
  "Sri Ramadasu",
  "Stalin",
  "Style",
  "Yogi",
  "Bujjigadu",
  "Billa",
  "Maska",
  "Ride",
  "Kalavar King",
  "Bheemili Kabaddi Jattu",
  "Pilla Zamindar",
  "Solo",
  "Routine Love Story",
  "Bus Stop",
  "Swamy Ra Ra",
  "Prema Katha Chitram",
  "Venkatadri Express",
  "Oohalu Gusagusalade",
  "Karthikeya",
  "Rowdy Fellow",
  "Asura",
  "Cinema Choopistha Mava",
  "Malli Malli Idi Rani Roju",
  "Jyo Achyutananda",
  "Appatlo Okadundevadu",
  "PSV Garuda Vega",
  "Mental Madhilo"
];

const RAW_LATEST_MOVIES = [
  "Jersey",
  "Majili",
  "Maharshi",
  "F2: Fun and Frustration",
  "Brochevarevarura",
  "Agent Sai Srinivasa Athreya",
  "Oh! Baby",
  "Evaru",
  "Gang Leader",
  "Ranarangam",
  "Saaho",
  "Mathu Vadalara",
  "Venky Mama",
  "Ala Vaikunthapurramuloo",
  "Sarileru Neekevvaru",
  "Bheeshma",
  "HIT: The First Case",
  "V",
  "Colour Photo",
  "Solo Brathuke So Better",
  "Jaanu",
  "Middle Class Melodies",
  "Uma Maheswara Ugra Roopasya",
  "Krack",
  "Uppena",
  "Jathi Ratnalu",
  "Vakeel Saab",
  "Love Story",
  "Most Eligible Bachelor",
  "Akhanda",
  "Pushpa: The Rise",
  "Shyam Singha Roy",
  "Republic",
  "Raja Raja Chora",
  "Narappa",
  "Tuck Jagadish",
  "Paagal",
  "Konda Polam",
  "Bheemla Nayak",
  "RRR",
  "Sarkaru Vaari Paata",
  "Major",
  "F3",
  "Karthikeya 2",
  "Sita Ramam",
  "Bimbisara",
  "Oke Oka Jeevitham",
  "GodFather",
  "Swathi Muthyam",
  "HIT: The Second Case",
  "Dhamaka",
  "Waltair Veerayya",
  "Veera Simha Reddy",
  "Dasara",
  "Balagam",
  "Virupaksha",
  "Agent",
  "Custody",
  "Samajavaragamana",
  "Baby",
  "Bro",
  "Miss Shetty Mr Polishetty",
  "MAD",
  "Bhagavanth Kesari",
  "Hi Nanna",
  "Extra Ordinary Man",
  "Hanu-Man",
  "Guntur Kaaram",
  "Eagle",
  "Ooru Peru Bhairavakona",
  "Gaami",
  "Om Bheem Bush",
  "Tillu Square",
  "Family Star",
  "Prasanna Vadanam",
  "Kalki 2898 AD",
  "Harom Hara",
  "Committee Kurrollu",
  "Saripodhaa Sanivaaram",
  "Mathu Vadalara 2",
  "Devara: Part 1",
  "Viswam",
  "Lucky Baskhar",
  "KA",
  "Zebra",
  "Pushpa 2: The Rule",
  "Daaku Maharaaj",
  "Sankranthiki Vasthunam",
  "Thandel",
  "Court: State vs A Nobody",
  "HIT: The Third Case",
  "Kingdom",
  "The Raja Saab",
  "They Call Him OG",
  "Kannappa",
  "Game Changer",
  "Mallesham",
  "Yatra",
  "Falaknuma Das",
  "118",
  "Chitralahari",
  "George Reddy",
  "Palasa 1978",
  "Aswathama",
  "Disco Raja",
  "Dirty Hari",
  "Gatham",
  "Savaari",
  "World Famous Lover",
  "Krishna and His Leela",
  "Naandhi",
  "SR Kalyanamandapam",
  "Arjuna Phalguna",
  "Skylab",
  "Romantic",
  "Lakshya",
  "Pushpaka Vimanam",
  "Varudu Kaavalenu",
  "Rowdy Boys",
  "Hero",
  "Bhamakalapam",
  "Stand Up Rahul",
  "Ghani",
  "Aadavallu Meeku Johaarlu",
  "Ashoka Vanamlo Arjuna Kalyanam",
  "Ante Sundaraniki",
  "Happy Birthday",
  "Pakka Commercial",
  "First Day First Show",
  "Krishna Vrinda Vihari",
  "Yashoda",
  "Masooda",
  "18 Pages",
  "Writer Padmabhushan",
  "Butta Bomma",
  "Amigos",
  "Das Ka Dhamki",
  "Phalana Abbayi Phalana Ammayi",
  "Ugram",
  "Hidimbha",
  "Slum Dog Husband",
  "Boys Hostel",
  "Bedurulanka 2012",
  "Rules Ranjann",
  "Month of Madhu",
  "Keedaa Cola",
  "Devil",
  "Ambajipeta Marriage Band",
  "Premalu (Telugu)",
  "Bhaje Vaayu Vegam",
  "Gam Gam Ganesha",
  "Paarijatha Parvam",
  "Manamey",
  "Satyabhama",
  "Aay",
  "Maruthi Nagar Subramanyam",
  "Pottel",
  "Janaka Aithe Ganaka",
  "Mangalavaaram",
  "Kismat",
  "Check",
  "Sashi",
  "Kinnerasani",
  "Ori Devuda",
  "Prince",
  "Michael",
  "Tiger Nageswara Rao",
  "Razakar",
  "Chaari 111",
  "Vinaro Bhagyamu Vishnu Katha",
  "DJ Tillu",
  "Bangarraju",
  "Mishan Impossible",
  "Virata Parvam",
  "Urvasivo Rakshasivo",
  "Meter",
  "Kushi",
  "Skanda",
  "Siddharth Roy",
  "Love Me",
  "Bhimaa",
  "Awe!",
  "Shatamanam Bhavati",
  "Raja Raja Chora",
  "MCA",
  "Ninnu Kori",
  "Jai Lava Kusa",
  "Spyder",
  "Hello",
  "Awe!",
  "Chalo",
  "Needi Naadi Oke Katha",
  "Chi La Sow",
  "RX 100",
  "Geetha Govindam",
  "Goodachari",
  "Sammohanam",
  "Ee Nagaraniki Emaindhi",
  "C/o Kancharapalem",
  "Mahanati",
  "Rangasthalam",
  "Bharat Ane Nenu",
  "Tholi Prema (2018 version)",
  "Spirit",
  "Fauji",
  "Raaka",
  "Dragon",
  "Godari gattupaina",
  "Ugly story",
  "Pysch siddartha",
  "IVNR",
  "Lucy Bhaskar",
  "OG",
  "jetlee",
  "Funkey",
  "Peddi",
  "Irumudi",
  "Mr bachan",
  "Andhra king thaluka",
  "Kanta",
  "Kantara",
  "Pushpa the rule",
  "Pushpa the rise"
];

// Helper to assign appropriate clues for the movies
function getCluesForMovie(title: string, era: '90s' | '2000s' | 'latest'): string[] {
  const norm = title.toLowerCase().trim();

  // Custom curated clues for high-profile ones
  if (norm.includes('jagadeka veerudu')) {
    return ['Chiranjeevi & Sridevi', 'K. Raghavendra Rao director', 'Celestial ring & fantasy', 'Inaamini Song'];
  }
  if (norm.includes('gang leader')) {
    return ['Chiranjeevi iconic role', 'Lorry entry & thumbs up', 'Vijayashanti', 'Gold medal song'];
  }
  if (norm.includes('aditya 369')) {
    return ['Nandamuri Balakrishna', 'Singeetam Srinivasa Rao', 'First Sci-Fi/Time Machine film', 'Krishna Deva Raya empire'];
  }
  if (norm.includes('chanti')) {
    return ['Venkatesh as innocent boy', 'Meena', 'Classic child-like hero', 'Huge blockbuster family drama'];
  }
  if (norm.includes('gharana mogudu')) {
    return ['Chiranjeevi as Raju', 'Nagma', 'Pandu song', 'Crossed 10 Crore share first time'];
  }
  if (norm.includes('hello brother')) {
    return ['Nagarjuna double action', 'Soundarya & Ramya Krishna', 'Priyaragale song', 'Action comedy hit'];
  }
  if (norm.includes('peddarayudu')) {
    return ['Mohan Babu dual role', 'Soundarya', 'Superstar Rajinikanth guest role', 'Panchayat justice'];
  }
  if (norm.includes('sisindri')) {
    return ['Baby Akhil debut', 'Nagarjuna', 'Babys Day Out adaptation', 'Hilarious kidnapping chase'];
  }
  if (norm.includes('annamayya')) {
    return ['Nagarjuna devotional', 'Lord Venkateswara singer', 'Classic devotional hit', 'Srimannarayana song'];
  }
  if (norm.includes('tholi prema')) {
    return ['Pawan Kalyan and Keerthi Reddy', 'Duffle bag intro scene', 'Classic romantic blockbuster', 'National Award winner'];
  }
  if (norm.includes('bavagaru bagunnara')) {
    return ['Chiranjeevi', 'Bungee jumping adventure', 'Rambha', 'Comedy super hit'];
  }
  if (norm.includes('samarasimha reddy')) {
    return ['Balakrishna faction hero', 'Simran', 'Rayalaseema faction benchmark', 'Thigh slap challenge'];
  }
  if (norm.includes('raja') && era === '90s') {
    return ['Venkatesh as painter/thief', 'Soundarya', 'Suresh Productions classic hit', 'Edo oka raagam song'];
  }
  if (norm.includes('badri')) {
    return ['Pawan Kalyan as Badri', 'Ameesha Patel', 'Chikitha song', 'Puri Jagannadh debut'];
  }
  if (norm.includes('kushi')) {
    return ['Pawan Kalyan & Bhumika', 'Siddhu and Madhumati', 'Navel coordinate scene', 'AM Ratnam'];
  }
  if (norm.includes('murari')) {
    return ['Mahesh Babu', 'Temple curse family sentiment', 'Sonali Bendre', 'Alanati Ramachandrudu song'];
  }
  if (norm.includes('indra')) {
    return ['Chiranjeevi', 'Veera Shankara Reddy dialogue', 'Kasi Ganges boat fight', 'Indrasena Reddy'];
  }
  if (norm.includes('manmadhudu')) {
    return ['Nagarjuna anti-romantic', 'Sonali Bendre', 'Trivikram witty dialogues', 'I Hate Women philosophy'];
  }
  if (norm.includes('okkadu')) {
    return ['Mahesh Babu Kabaddi player', 'Charminar Konda Reddy Buruju set', 'Obul Reddy villain chase', 'Bhumika'];
  }
  if (norm.includes('simhadri')) {
    return ['Jr NTR with axes', 'Rajamouli massive action blast', 'Kerala backwaters search', 'Bhumika'];
  }
  if (norm.includes('arya')) {
    return ['Allu Arjun debut block', 'One-side love philosophy', 'Feel My Love song', 'Sukumar debut'];
  }
  if (norm.includes('athadu')) {
    return ['Mahesh Babu professional hitman', 'Pardhu impersonation', 'Trisha', 'Trivikram dialogs'];
  }
  if (norm.includes('pokiri')) {
    return ['Mahesh Babu as Pandu gadu', 'Undercover IPS officer', 'Ileana', 'Eppudu vachamannadi song'];
  }
  if (norm.includes('bommarillu')) {
    return ['Siddharth & Genelia', 'Over-caring father Aravind', 'Haasini bubbly character', 'Antuodu song'];
  }
  if (norm.includes('godavari')) {
    return ['Sumanth & Kamalinee Mukherjee', 'River cruise boat journey', 'Dog voiceover intro', 'Sekhar Kammula classic'];
  }
  if (norm.includes('jalsa')) {
    return ['Pawan Kalyan as Sanjay Sahu', 'Trivikram dialogues', 'Ileana & Parvati Melton', 'Sanjay Sahu comedy'];
  }
  if (norm.includes('arundhati')) {
    return ['Anushka Shetty as Jejamma', 'Sonu Sood Pasupathi villain', 'Vajramma castle horror', 'Blockbuster fantasy'];
  }
  if (norm.includes('magadheera')) {
    return ['Ram Charan royal warrior', 'Kajal Aggarwal princess', '100 soldiers bridge fight', 'SS Rajamouli rebirth'];
  }
  if (norm.includes('jersey')) {
    return ['Nani as older cricketer Arjun', 'Shraddha Srinath', 'Railway station shouting scene', 'Emotional father-son bond'];
  }
  if (norm.includes('ala vaikunthapurramuloo') || norm.includes('ala vaikunta')) {
    return ['Allu Arjun as Bantu', 'Boardroom dance meeting', 'Pooja Hegde', 'Samajavaragamana hit song'];
  }
  if (norm.includes('pushpa: the rise') || norm.includes('pushpa the rise')) {
    return ['Allu Arjun red sandalwood smuggler', 'Thaggede Le dialogue & shoulder tilt', 'Rashmika as Srivalli', 'Oo Antava song'];
  }
  if (norm.includes('rrr')) {
    return ['SS Rajamouli action epic', 'NTR as Bheem, Ram Charan as Raju', 'Naatu Naatu Oscar award song', 'British prison breakout'];
  }
  if (norm.includes('sita ramam')) {
    return ['Dulquer Salmaan & Mrunal Thakur', 'Kashmir army letters romance', 'Hanuragudi beautiful cinematography', 'Innum Innum song'];
  }
  if (norm.includes('kalki')) {
    return ['Prabhas in futuristic sci-fi', 'Amitabh Bachchan as Ashwatthama', 'Nag Ashwin dystopian epic', 'Bujji vehicle'];
  }

  // Fallback clues
  const words = title.split(' ');
  const wordCount = words.length;
  const firstLetter = title.trim().charAt(0).toUpperCase();

  let eraHint = "";
  if (era === '90s') {
    eraHint = "🎞️ Retro 90s Classic Hit";
  } else if (era === '2000s') {
    eraHint = "🌟 2000s Evergreen Blockbuster";
  } else {
    eraHint = "🔥 Latest / Modern Blockbuster Sensation";
  }

  return [
    eraHint,
    `Title has ${wordCount} word${wordCount > 1 ? 's' : ''}`,
    `Starts with letter: "${firstLetter}"`,
    "Describe/Act/Hum this popular movie name to your team!",
    "Beloved by Tollywood film lovers!"
  ];
}

// Generates the clean database with unique names matching the requested categories
export function generateMovieDatabase(): Movie[] {
  const result: Movie[] = [];
  
  // Create normalized sets of each raw list to identify overlaps
  const set90s = new Set(RAW_90S_MOVIES.map(t => t.trim().toLowerCase()));
  const set2000s = new Set(RAW_2000S_MOVIES.map(t => t.trim().toLowerCase()));
  const setLatest = new Set(RAW_LATEST_MOVIES.map(t => t.trim().toLowerCase()));

  // Identify any movie name present in ALL three categories to remove them completely
  const presentInAllThree = new Set<string>();
  const allPossibleKeys = new Set([...set90s, ...set2000s, ...setLatest]);

  allPossibleKeys.forEach(key => {
    let appearances = 0;
    if (set90s.has(key)) appearances++;
    if (set2000s.has(key)) appearances++;
    if (setLatest.has(key)) appearances++;

    if (appearances === 3) {
      presentInAllThree.add(key);
    }
  });

  const seenTitles = new Set<string>();

  // Helper inside loop to add movie if not in all three and not seen already
  const addMovie = (title: string, era: '90s' | '2000s' | 'latest') => {
    const cleanTitle = title.trim();
    const key = cleanTitle.toLowerCase();
    if (!presentInAllThree.has(key) && !seenTitles.has(key)) {
      seenTitles.add(key);
      result.push({
        id: `${era}-${result.length}`,
        title: cleanTitle,
        era: era,
        clues: getCluesForMovie(cleanTitle, era)
      });
    }
  };

  // Process 90s first
  RAW_90S_MOVIES.forEach(title => addMovie(title, '90s'));

  // Process 2000s second
  RAW_2000S_MOVIES.forEach(title => addMovie(title, '2000s'));

  // Process Latest third
  RAW_LATEST_MOVIES.forEach(title => addMovie(title, 'latest'));

  return result;
}

// Generates a balanced round-robin queue for the 'mixed' category, alternating eras fairly
export function generateBalancedMixedQueue(movies: Movie[]): Movie[] {
  // Filter movies into their three distinct eras and shuffle each separately
  const queue90s = movies.filter(m => m.era === '90s').sort(() => Math.random() - 0.5);
  const queue2000s = movies.filter(m => m.era === '2000s').sort(() => Math.random() - 0.5);
  const queueLatest = movies.filter(m => m.era === 'latest').sort(() => Math.random() - 0.5);

  const mixedQueue: Movie[] = [];

  // Implement the Token Method: After every 3 selections, redistribute fairly
  while (queue90s.length > 0 || queue2000s.length > 0 || queueLatest.length > 0) {
    const availableEras: Array<'90s' | '2000s' | 'latest'> = [];
    if (queue90s.length > 0) availableEras.push('90s');
    if (queue2000s.length > 0) availableEras.push('2000s');
    if (queueLatest.length > 0) availableEras.push('latest');

    if (availableEras.length === 0) break;

    // Shuffle current token set
    const shuffledTokens = [...availableEras].sort(() => Math.random() - 0.5);

    // Pop one movie from each selected era in the shuffled order
    for (const era of shuffledTokens) {
      if (era === '90s') {
        const movie = queue90s.pop();
        if (movie) mixedQueue.push(movie);
      } else if (era === '2000s') {
        const movie = queue2000s.pop();
        if (movie) mixedQueue.push(movie);
      } else if (era === 'latest') {
        const movie = queueLatest.pop();
        if (movie) mixedQueue.push(movie);
      }
    }
  }

  return mixedQueue;
}

