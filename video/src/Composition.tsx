import { Composition } from "remotion";
import { FlowBattery, LOOP } from "./FlowBattery";

export const MyComposition = () => {
  return (
    <Composition
      id="FlowBattery"
      component={FlowBattery}
      durationInFrames={LOOP}
      fps={30}
      width={1600}
      height={1000}
    />
  );
};
