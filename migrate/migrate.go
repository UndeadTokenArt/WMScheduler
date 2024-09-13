package main

import (
	"github.com/undeadtoken/WMscheduler/initializers"
	"github.com/undeadtoken/WMscheduler/models"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectDB()
}

func main() {
	initializers.DB.AutoMigrate(&models.Route{})

}
