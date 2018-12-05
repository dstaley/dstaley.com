import React from "react";
import avatar1x from "./avi@1x.jpg";
import avatar2x from "./avi@2x.jpg";
import avatar3x from "./avi@3x.jpg";
import avatar4x from "./avi@4x.jpg";

const ProfilePicture = () => (
  <img
    alt="Dylan Staley"
    src={avatar1x}
    srcset={`${avatar1x}, ${avatar2x} 2x, ${avatar3x} 3x, ${avatar4x} 4x`}
  />
);

export default ProfilePicture;
