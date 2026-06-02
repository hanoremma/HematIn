import { useNavigate } from "react-router-dom";

const ProfileMenu = () => {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const initials =
  user?.username
    ?.split(" ")
    .map(word => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (

    <div
      className="profile-box"
      style={{
        cursor: "pointer"
      }}
      onClick={() => navigate("/profile")}
    >

      <div
        className="profile-initials"
      >
        {initials}
      </div>

      <div>

        <h5>
          {user?.username || "User"}
        </h5>

        <p>
          User
        </p>

      </div>

    </div>

  );

};

export default ProfileMenu;