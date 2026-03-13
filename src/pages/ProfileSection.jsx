import "../styles/profileSection.css"

export default function ProfileSection({
  myProfile,
  getAvatarColor,
  setShowProfile,
  setProfileEmail
}) {

  function myAvatar() {

    if (!myProfile) return null;

    if (myProfile.profilePicture) {
      return <img src={myProfile.profilePicture} alt="" />;
    }

    const letter =
      (myProfile.username || myProfile.email)
        .charAt(0)
        .toUpperCase();

    return (
      <div
        className="avatar-letter"
        style={{
          backgroundColor: getAvatarColor(myProfile.email)
        }}
      >
        {letter}
      </div>
    );
  }

  return (

    <div
      className="sidebar-profile-container"
      onClick={() => {
        setProfileEmail(null);
        setShowProfile(true);
      }}
    >

      <div className="sidebar-profile">
        {myAvatar()}
      </div>

      {myProfile && (
        <div className="sidebar-name">
          {myProfile.username || myProfile.email}
        </div>
      )}

    </div>

  );
}