// /atoms/filterAtom.js
import { atom } from "jotai";

export const filterAtom = atom({
  near_me: false,
  categories: [],
  price: false,
  rating: false,
  opening_hours: false
});