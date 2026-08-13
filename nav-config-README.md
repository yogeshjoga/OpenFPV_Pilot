# Navigation Configuration Guide

This guide explains how to use the navigation configuration file to show or hide the "Academy" menu item in the navigation bar.

## File Location
The configuration file is located at: `src/config/navConfig.json`

## Configuration Options
The file contains a simple JSON object:
```json
{
  "showAcademyNav": true
}
```

### Hiding the Academy Menu Item
To hide the "Academy" menu item from the navigation bar, change the value of `showAcademyNav` to `false`:
```json
{
  "showAcademyNav": false
}
```

### Enabling the Academy Menu Item
To show the "Academy" menu item again, change the value of `showAcademyNav` to `true`:
```json
{
  "showAcademyNav": true
}
```

## How it works
The configuration is imported directly into `src/config/constants.js`. The `NAV_LINKS` array dynamically includes the "Academy" section based on the boolean value you set in `navConfig.json`. If it's true, the academy object is included, and if false, it is excluded automatically. 

Note: You might need to restart the development server or refresh the page for the changes to apply depending on your hot-reload setup.
