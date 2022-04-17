App = {
    web3Provider: null,
    contracts: {},
  
    init: async function() {
      // Load destinations.
      $.getJSON('../destinations.json', function(data) {
        var destinationsRow = $('#destinationRow');
        var destinationTemplate = $('#destinationTemplate');
  
        for (i = 0; i < data.length; i ++) {
          destinationTemplate.find('.panel-title').text(data[i].Destination);
          destinationTemplate.find('img').attr('src', data[i].Picture);
          destinationTemplate.find('.travel-group').text(data[i].For);
          destinationTemplate.find('.travel-date').text(data[i].Date);
          destinationTemplate.find('.travel-duration').text(data[i].Duration);
          destinationTemplate.find('.btn-book').attr('data-id', data[i].id);
  
          destinationsRow.append(destinationTemplate.html());
        }
      });
  
      return await App.initWeb3();
    },
  
    initWeb3: async function() {
      // Modern dapp browsers...
  if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
      // Request account access
      await window.ethereum.request({method:'eth_requestAccounts'});
    } catch (error) {
      // User denied account access...
      console.error("User denied account access")
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
  }
  web3 = new Web3(App.web3Provider);
  
  
      return App.initContract();
    },
  
    initContract: function() {
      $.getJSON('TravelBooking.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var TravelBookingArtifact = data;
        App.contracts.TravelBooking = TruffleContract(TravelBookingArtifact);
      
        // Set the provider for our contract
        App.contracts.TravelBooking.setProvider(App.web3Provider);
      
        // Use our contract to retrieve and mark the booked destinations
        return App.markBooked();
      });
      
  
      return App.bindEvents();
    },
  
    bindEvents: function() {
      $(document).on('click', '.btn-book', App.handleBook);
    },
  
    markBooked: function() {
        var travelBookingInstance;
    
        App.contracts.TravelBooking.deployed().then(function(instance) {
          travelBookingInstance = instance;
        
          return travelBookingInstance.getTourists.call();
        }).then(function(tourists) {
          for (i = 0; i < tourists.length; i++) {
            if (tourists[i] !== '0x0000000000000000000000000000000000000000') {
              $('.panel-destinations').eq(i).find('button').text('Success').attr('disabled', true);
            }
          }
        }).catch(function(err) {
          console.log(err.message);
        });
        
      },
  
    handleBook: function(event) {
      event.preventDefault();
  
      var touristId = parseInt($(event.target).data('id'));
  
      var bookingInstance;
  
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
      
        var account = accounts[0];
      
        App.contracts.TravelBooking.deployed().then(function(instance) {
          bookingInstance = instance;
      
          // Execute book as a transaction by sending account
          return bookingInstance.book(touristId, {from: account});
        }).then(function(result) {
          return App.markBooked();
        }).catch(function(err) {
          console.log(err.message);
        });
      });
      
    }
  
  };
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
  