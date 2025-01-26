package controllers

import (
	"database/sql"
	"fmt"

	"github.com/undeadtoken/WMscheduler/models"
)

// Function to insert an address into the database
func InsertAddress(db *sql.DB, address models.Address) error {
	stmt, err := db.Prepare("INSERT INTO addresses (Street, City, State, Zipcode, Latitude, Longitude) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		return fmt.Errorf("failed to prepare insert statement: %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(address.Street, address.City, address.State, address.ZipCode, address.Latitude, address.Longitude)
	if err != nil {
		return fmt.Errorf("failed to execute insert statement: %w", err)
	}

	return nil
}

// Function to check if an address exists in the database and get its coordinates
func GetAddressCoords(db *sql.DB, street, city, state, zipcode string) (float64, float64, error) {
	var latitude, longitude float64

	row := db.QueryRow("SELECT Latitude, Longitude FROM addresses WHERE Street = ? AND City = ? AND State = ? AND Zipcode = ?", street, city, state, zipcode)
	err := row.Scan(&latitude, &longitude)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, 0, fmt.Errorf("address not found in database")
		}
		return 0, 0, fmt.Errorf("failed to scan row: %w", err)
	}

	return latitude, longitude, nil
}
