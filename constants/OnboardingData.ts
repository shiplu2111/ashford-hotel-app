export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string;
}

export const ONBOARDING_DATA: OnboardingSlide[] = [
  {
    id: "1",
    title: "Discover Luxury",
    description:
      "Explore our curated collection of five-star hotels and premium suites tailored for your comfort.",
    image: "https://theashford.com.au/assets/img/banner/2026-04-27/W1.jpg",
  },
  {
    id: "2",
    title: "Seamless Booking",
    description:
      "Book your stay in seconds with our intuitive and secure reservation system. No hidden fees.",
    image: "https://theashford.com.au/assets/img/banner/2026-04-27/5.jpeg",
  },
  {
    id: "3",
    title: "Elite Services",
    description:
      "Enjoy 24/7 concierge support, spa treatments, and world-class dining at your fingertips.",
    image: "https://theashford.com.au/assets/img/banner/2026-04-27/12.jpeg",
  },
];
