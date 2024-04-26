"use client";
import {Button} from "@/components/ui/button";

import {usePrivy} from "@privy-io/react-auth";
import {useEffect, useState} from "react";
import {IUser} from "@/models/user";
import MintPage from "@/components/mint-page";

export default function Home() {
  const {authenticated, login, ready, user} = usePrivy();
  const [userInfo, setUserInfo] = useState<IUser>({
    wallets: [],
    email: "",
    balance: 5,
  } as unknown as IUser);

  useEffect(() => {
    if (!user?.email?.address) return;

    const isUserExist = async () => {
      if (authenticated) {
        const existingUser = await fetch(
          `/api/user?email=${user?.email?.address}`
        );
        const data = await existingUser.json();

        if (data.status === 404) {
          await fetch(`/api/user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user?.email?.address,
              wallets: [],
              method: "create_user",
              balance: 5,
            }),
          });
        }
      }
    };
    isUserExist();
  }, [user?.email?.address, authenticated, user]);
  return (
    <>
      {authenticated ? (
        <MintPage userInfo={userInfo} />
      ) : (
        <div className="flex flex-col items-center px-6 mt-[40%] md:mt-[15%]">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl">
            Collect you Values!
          </h1>
          <p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
            Sign up and mint your values onchain.
          </p>
          <Button
            variant="default"
            onClick={login}
            disabled={!ready || authenticated}
            className="my-4"
          >
            Get Started
          </Button>
        </div>
      )}
    </>
  );
}
