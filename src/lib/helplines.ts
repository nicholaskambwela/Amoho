export interface Helpline {
  name: string;
  type: string;
  phones: string[];
  location?: string;
  email?: string;
  city: string;
}

export const CRISIS_LINE = {
  name: "Lifeline Zambia",
  phone: "933",
  description: "Free, nationwide mental health crisis line",
};

export const HELPLINES: Helpline[] = [
  // LUSAKA
  {
    name: "Chainama Mental Hospital",
    type: "Mental Hospital",
    phones: ["+260 966 750407"],
    location: "Great East Rd, Lusaka",
    city: "Lusaka",
  },
  {
    name: "UTH Psychiatric Unit 6",
    type: "Hospital",
    phones: ["+260 977 292055", "+260 977 347428"],
    location: "Private Bag RW1X Ridgeway, Nationalist Rd, Lusaka",
    city: "Lusaka",
  },
  {
    name: "Abundant Hope Psychotherapy Centre",
    type: "Psychotherapy Centre",
    phones: ["+260 969 878987", "+260 977 960685"],
    location: "Plot no. 6, Kudu Road, Kabulonga",
    city: "Lusaka",
  },
  {
    name: "Psychealth Zambia",
    type: "Counseling & Therapy Centre",
    phones: ["+260 955 264975"],
    location: "Corner Kabelenga and Longolongo Rd",
    city: "Lusaka",
  },
  {
    name: "MNK Psychotherapy & Wellness Centre",
    type: "Psychotherapy Centre",
    phones: ["+260 976 556280", "+260 969 444808"],
    location: "Plot 407a, Independence Avenue, Woodlands",
    city: "Lusaka",
  },
  {
    name: "Serenity Wellness Center",
    type: "Mental Health Wellness Centre",
    phones: ["+260 979 979318"],
    location: "Plot 220C Mutandwa Road, Roma",
    city: "Lusaka",
  },
  {
    name: "Walk with Me Foundation",
    type: "Mental Health Awareness & Support",
    phones: ["+260 961 877947"],
    email: "info@walkwithmefoundationzm.org",
    city: "Lusaka",
  },
  {
    name: "Chilenje First Level Hospital — Mental Health Unit",
    type: "Hospital",
    phones: [],
    location: "Plot 10111 Muramba Rd, off Chilumbululu Rd, Chilenje",
    city: "Lusaka",
  },
  // NDOLA
  {
    name: "Ndola Teaching Hospital — Psychiatry Unit",
    type: "Hospital",
    phones: [],
    location: "Corner of Broadway and Nkana Roads, Ndola",
    city: "Ndola",
  },
  {
    name: "Dr. Venevivi",
    type: "Clinical Psychiatrist",
    phones: ["+260 955 080154"],
    location: "City Specialist Centre, Kansenshi Mall",
    city: "Ndola",
  },
  // KITWE
  {
    name: "Dynamic Counselling Services",
    type: "Licensed Professional Counsellor",
    phones: ["+260 962 876100"],
    email: "barbara@dynamiccounsellingservices.com",
    city: "Kitwe",
  },
  {
    name: "Rahj's Counselling Service",
    type: "Counselor",
    phones: ["+260 955 125629"],
    location: "Chimwemwe, Kitwe",
    city: "Kitwe",
  },
  {
    name: "Kitwe Teaching Hospital",
    type: "Hospital",
    phones: [],
    location: "Former Pasmo Clinic, Plot 2831, Kuomboka Dr, Parklands",
    city: "Kitwe",
  },
  // KABWE
  {
    name: "Bridge Therapy Center",
    type: "Treatment Center",
    phones: ["+260 955 637964"],
    location: "Plot No. 35 Railway, Kabwe",
    email: "zedbridgetherapy@gmail.com",
    city: "Kabwe",
  },
];

export const CITIES = ["All", "Lusaka", "Ndola", "Kitwe", "Kabwe"] as const;
