import { Motion, spring } from "react-motion";
import React from "react";

export function AlphabetSpinner(props) {
  const alphabets = "',: @-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.".split(
    ""
  );

  const findPosition = char => {
    return alphabets.indexOf(char);
  };

  return (
    <Motion
      defaultStyle={{ top: 0 }}
      style={{ top: spring(findPosition(props.alphabet)) }}
    >
      {val => {
        let style = {
          position: "absolute",
          top: val.top * 55 * -1
        };
        return (
          <div className="bit">
            <div style={style}>
              {alphabets.map(char => {
                let bitClass = "bit-char";
                if (char === props.alphabet) {
                  bitClass += " active ";
                }
                return (
                  <div key={char} className={bitClass}>
                    {char}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }}
    </Motion>
  );
}

export function CharSpinners(props) {
  let abbreviated =
    props.num.length > 70
      ? "Entry: " + props.num.substr(0, 30) + "..."
      : props.num;
  let spinners = abbreviated
    .split("")
    .map((alphabet, i) => <AlphabetSpinner key={i} alphabet={alphabet} />);
  return <div className="holder">{spinners}</div>;
}
