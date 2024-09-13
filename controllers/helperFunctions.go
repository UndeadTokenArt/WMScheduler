package controllers

import (
	"github.com/undeadtoken/WMscheduler/initializers"
	"github.com/undeadtoken/WMscheduler/models"
	"gorm.io/gorm"
)

func isExistingRoute(routeName string) bool {
	var route models.Route
	// Query the database to find a route with the given name
	result := initializers.DB.Where("route_name = ?", routeName).First(&route)

	// Check if a match was found
	return result.Error != gorm.ErrRecordNotFound
}
