function Partition(price, noofrooms, occupancy, offset, hidePercentInfo) {
    this.price = price;
    this.noofrooms = Math.round(noofrooms);
    this.occupancy= occupancy;
    this.offset = offset;
    this.hidePercentInfo = hidePercentInfo;
}

Partition.prototype.lendTo = function (other) {
    other.occupancy = this.occupancy+ other.occupancy;
    other.noofrooms += this.noofrooms;
    other.offset = Math.max(this.offset, other.offset);
};

Partition.prototype.updateOffset = function (left, right) {
    this.offset = this.offset ? Number(this.offset): 0;
    var leftOffset = left ? Number(left.offset) : 0;
    var rightOffset = right ? Number(right.offset) : 100;
    var lowerLimit = 10;
    var currentOccupancyDiff = this.offset - leftOffset;
    var rightOccupancyDiff = rightOffset - this.offset;

    if (isBeyondLimits(this)) {
        resetOffset(this)
    } else {
        var oldLeftRoomsCount = this.noofrooms;
        var totalRooms = this.noofrooms + right.noofrooms;
        this.occupancy = this.offset - leftOffset;
        this.noofrooms = Math.round(totalRooms*(this.offset -leftOffset)/(rightOffset-leftOffset));
        right.occupancy = rightOffset - this.offset;
        right.noofrooms -= (this.noofrooms - oldLeftRoomsCount)
    }

    function isBeyondLimits(that) {
        return that.offset > rightOffset || that.offset < leftOffset
            || currentOccupancyDiff < lowerLimit || rightOccupancyDiff < lowerLimit
    }

    function resetOffset(that) {
        that.offset = that.occupancy + leftOffset;
    }
};

Partition.prototype.split = function () {
    var oldLeftRoomsCount = this.noofrooms;
    var clonePercent = Math.round(this.occupancy/2);
    this.occupancy= this.occupancy- clonePercent;
    this.noofrooms= Math.round(this.noofrooms/2);

    var roomsForClone = (oldLeftRoomsCount - this.noofrooms);

    return new Partition(this.price, roomsForClone, clonePercent, this.offset - this.occupancy, true);
};

Partition.prototype.isValidSplit = function () {
    var clonePercent = Math.round(this.occupancy/2);
    return clonePercent >= 10 && this.noofrooms > 1;
};

