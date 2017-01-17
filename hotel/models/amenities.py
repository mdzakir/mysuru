from enum import Enum


class Amenities(Enum):
    RAIL_TRANSFER = (1, "Railway Transfer", "")
    AIRPORT_TRANSFER = (2, "Airport Transfer", "icon-fontic-hotel-airport")
    AYURVEDA_CENTRE = (3, "Ayurveda Center", "")
    BANQUET_HALL = (4, "Banquet Hall", "")
    BUSINESS_CENTER = (5, "Business Center", "")
    BAR = (6, "Bar", "icon-fontic-hotel-drink")
    CABLE_TV = (7, "Cable TV", "icon-fontic-hotel-tv")
    CAR_RENTAL_FACILITY = (8, "Car Rental", "icon-fontic-hotel-taxi")
    TEA_AND_COFFEE_MAKER = (9, "Tea and Coffee Maker", "icon-coffee")
    CONFERENCE_FACILITIES = (10, "Conference Facility", "")
    CREDIT_CARDS_ACCEPTED = (11, "Credit Card", "icon-fontic-hotel-card")
    DOCTOR_ON_CALL = (12, "Doctor on Call", "icon-fontic-hotel-hospital")
    DRY_CLEANING_SERVICE = (13, "Dry Clean", "")
    GOLF = (14, "Golf", "icon-fontic-hotel-golf")
    GYM = (15, "Gym", "icon-fontic-hotel-gym")
    HANDICAPPED = (16, "Special Assistance", "icon-fontic-hotel-disabled")
    HOT_WATER = (17, "Hot Water", "icon-fontic-hotel-water")
    INTERNET_FACILITY = (18, "Internet", "icon-globe")
    LAUNDRY = (19, "Laundry", "icon-fontic-hotel-washing-machine")
    OUTDOOR_GAMES = (20, "Outdoor Games", "icon-fontic-hotel-football")
    PARKING_FACILITY = (21, "Parking", "icon-fontic-hotel-parking")
    PETS_ALLOWED = (22, "Pets Allowed", "icon-fontic-hotel-pet")
    SWIMMING_POOL = (23, "Swimming Pool", "icon-fontic-hotel-swimming-pool")
    POWER_BACKUP_GENERATOR = (24, "Power Backup", "icon-fontic-hotel-connect")
    ROOM_SERVICE = (25, "Room Service", "icon-fontic-hotel-maide")
    RESTAURANT = (26, "Restaurant", "icon-fontic-hotel-restaurant")
    SAFETY_DEPOSIT_LOCKERS = (27, "Locker", "icon-fontic-hotel-safe")

    def __init__(self, id, ame_name, ame_icon):
        self.ame_name = ame_name
        self.ame_icon = ame_icon
        self.id = id

    @property
    def get_ame_name(self):
        return self.ame_name

    @property
    def get_id(self):
        return self.id

    @property
    def get_ame_icon(self):
        return self.ame_icon

    @classmethod
    def get_amenities(cls):
        return cls.__members__.values()
