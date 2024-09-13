package models

import "gorm.io/gorm"

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
 type DBpattern struct {
	routes []Route
	driver []Driver
 }