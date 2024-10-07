"use client";

import {useEffect} from "react";

export default function Home() {
  useEffect(() => {
    window.location.href = "https://app.valuesdao.io";
  }, []);
  return <main></main>;
}
