import React from "react";

import Card from "../../shared/components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import Button from "../../shared/components/FormElements/Button";

import "./PlaceList.css";

const PlaceList = ({ items, onPlaceDelete }) => {
  if (items.length === 0) {
    return (
      <div className="place-list center">
        <Card>
          <h2>No such place found. Maybe create one?</h2>
          <Button to="/places/new"> Share Place</Button>
        </Card>
      </div>
    );
  }
  return (
    <ul className="place-list">
      {items.map(
        ({ id, image, title, description, address, creator, location }) => (
          <PlaceItem
            key={id}
            id={id}
            image={image}
            title={title}
            description={description}
            address={address}
            creatorId={creator}
            coordinates={location}
            onDelete={onPlaceDelete}
          />
        )
      )}
    </ul>
  );
};

export default PlaceList;
