// lib
import { atom } from "recoil";

// types
import { Log } from "../../classes/Logger";

export const logsState = atom<Log[]>({
  key: "logs",
  default: [],
});