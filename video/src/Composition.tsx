import { Composition } from "remotion";
import { DayCycle, DAY_LOOP } from "./DayCycle";
import { FlowBattery, LOOP } from "./FlowBattery";
import { HERO_LOOP, HeroIntro, HeroLoop, INTRO } from "./Hero";

export const MyComposition = () => {
  return (
    <>
      <Composition id="HeroIntro" component={HeroIntro} durationInFrames={INTRO} fps={30} width={1920} height={1080} />
      <Composition id="HeroLoop" component={HeroLoop} durationInFrames={HERO_LOOP} fps={30} width={1920} height={1080} />
      <Composition id="FlowBattery" component={FlowBattery} durationInFrames={LOOP} fps={30} width={1600} height={1000} />
      <Composition id="DayCycle" component={DayCycle} durationInFrames={DAY_LOOP} fps={30} width={1600} height={960} />
    </>
  );
};
