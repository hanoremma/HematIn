import {
  useEffect,
  useState
} from "react";

import {
  toast
} from "react-toastify";

import {

  getProfile,
  updateProfile

} from "../../services/profileService";

const ProfilePage = () => {

  const [profile, setProfile] =
    useState({

      username: "",
      email_user: ""

    });

  const [loading, setLoading] =
    useState(false);

  const token =
    localStorage.getItem("token");

  const fetchProfile =
    async () => {

      try {

        const data =
          await getProfile(
            token
          );

        setProfile(data);

      } catch (error) {

        console.log(error);

        toast.error(
          "Gagal mengambil profil"
        );

      }

    };

  useEffect(() => {

  const loadProfile = async () => {

    try {

      const data =
        await getProfile(token);

      setProfile(data);

    } catch (error) {

      console.log(error);

    }

  };

  loadProfile();

}, [token]);

  const handleUpdate =
    async () => {

      try {

        setLoading(true);

        const response =
          await updateProfile(
            token,
            {

              username:
                profile.username
            }
          );
        localStorage.setItem(
          "user",
          JSON.stringify(
            response.user
          )
        );

        toast.success(
          "Profil berhasil diperbarui"
        );

        fetchProfile();

      } catch (error) {

        console.log(error);

        toast.error(
          "Gagal memperbarui profil"
        );

      } finally {

        setLoading(false);

      }

    };

  return (

    <div className="profile-page">

      <div className="profile-card">

        <h3>
          Profil Saya
        </h3>

        <div className="form-group">

          <label>
            Nama
          </label>

          <input
            value={profile.username}
            onChange={(e) =>
              setProfile({

                ...profile,

                username:
                  e.target.value

              })
            }
          />

        </div>

        <div className="form-group">

          <label>
            Email
          </label>

          <input
            value={
              profile.email_user
            }
            disabled
          />

        </div>

        <button

          className="save-btn"

          onClick={
            handleUpdate
          }

          disabled={
            loading
          }

        >

          {

            loading

            ? "Menyimpan..."

            : "Simpan Perubahan"

          }

        </button>

      </div>

    </div>

  );

};

export default ProfilePage;