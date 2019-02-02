// todo: get full list of supported languages
const LANGUAGE_OPTIONS = [{ key: "en", value: "English" }, { key: "fr", value: "French" }];

function userPresenter(user, view) {
  // only pass down the neccessary user data for the edit view
  const userEditKeys = [
    "id",
    "hidden",
    "name",
    "email",
    "location",
    "language",
    "login",
    "picture_url",
    "bio",
    "isadmin",
    "join_date"
  ];
  const userEditJSON = {};
  userEditKeys.forEach(key => userEditJSON[key] = user[key]);

  // static text keys needed for user-edit
  const userEditstaticText = {
    languageOptions: LANGUAGE_OPTIONS,
    public_profile: "Public Profile",
    change: "Change",
    member_since: "Member Since",
    name_label: "Name",
    name_instructional: "name_instructional",
    name_placeholder: "name placeholder",
    location_label: "Location",
    location_instructional: "location_instructional",
    location_placeholder: "location placeholder",
    bio_label: "Bio",
    bio_instructional: "bio_instructional",
    bio_placeholder: "bio placeholder",
    private_settings: "Private Settings",
    email_label: "Email",
    email_instructional: "email_instructional",
    email_placeholder: "email_placeholder",
    password_label: "Password",
    password_instructional: "password_instructional",
    current_password_placeholder: "current_password_placeholder",
    new_password_placeholder: "new_password_placeholder",
    confirm_new_password_placeholder: "confirm_new_password_placeholder",
    language_label: "language_label",
    language_instructional: "language_instructional",
    language_placeholder: "language_placeholder",
    publish: "Publish",
  };

  // static text needed for user profile view
  const userViewStaticText = {
    profile_picture: "profile picture",
    edit_profile: "Edit Profile",
    member_since: "Member Since",
    location: "Location",
  };

  if (view === "edit") {
    return {
      user: userEditJSON,
      static: userEditstaticText,
    }
  } else {
    return {
      user: user,
      static: userViewStaticText,
    }
  }
};

module.exports = userPresenter;
