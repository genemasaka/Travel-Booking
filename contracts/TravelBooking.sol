pragma solidity >=0.4.2 < 0.9.0;

contract TravelBooking{
    address[6] public tourists;

    function book(uint destinationId) public returns(uint){
        require(destinationId>=0 && destinationId<=5);
        tourists[destinationId] = msg.sender;
        return destinationId;
    }

    function getTourists() public view returns(address[6] memory){
        return tourists;
    }
}