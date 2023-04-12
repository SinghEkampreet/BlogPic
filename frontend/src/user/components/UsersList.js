import React from "react";

import UserItem from "./UserItem";
import Card from "../../shared/components/UIElements/Card";
import "./UsersList.css";

const UsersList = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="center">
        <Card>
          <h1>No Users Found</h1>
        </Card>
      </div>
    );
  }

  return (
    <ul className="users-list">
      {items.map(({ id, image, name, places }) => (
        <UserItem
          key={id}
          id={id}
          image={image}
          name={name}
          placeCount={places.length}
        />
      ))}
    </ul>
  );
};

export default UsersList;
