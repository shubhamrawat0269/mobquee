import React, { useEffect } from "react";
import "./GridTileStyle.css";

const GridTile = ({ addedRowsList }) => {
  // console.log(addedRowsList);
  return (
    <>
      {addedRowsList.map((cell) => {
        return (
          <div
            style={{
              width: "100%",
              height: cell.height,
              border: "1.5px dotted red",
              borderTop: "none",
            }}
            key={cell.id}
          >
            {/* {console.log(cell)} */}
            {/* {cell.columns.map((cur, id) => {
              return (
                <div
                  key={id}
                  style={{
                    width: 100,
                    height: cur.height,
                    borderTop: "none",
                    borderLeft: "none",
                    borderBottom: "none",
                    borderRight: "1.5px solid orange",
                  }}
                ></div>
              );
            })} */}
          </div>
        );
      })}
    </>
  );
};

export default GridTile;
