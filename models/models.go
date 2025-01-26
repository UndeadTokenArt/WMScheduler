package models

import "gorm.io/gorm"

type DBSchema struct {
	routes  []Route
	driver  []Driver
	Address []Address
}
type Route struct {
	gorm.Model
	RouteName string `json:"routename"`
	Driver    string `json:"driver"`
	Truck     string `json:"truck"`
	Disposal  string `json:"disposal"`
	Cover     string `json:"cover"`
	Comments  string `json:"comments"`
}

type Driver struct {
	gorm.Model
	Name string `json:"name"`
}

// Address struct to store geolocation information
type Address struct {
	Street    string  `json:"street"`
	City      string  `json:"city"`
	State     string  `json:"state"`
	ZipCode   string  `json:"zipcode"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}
