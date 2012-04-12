$(document).ready(function() {
  var realmSlug;
  var names = [];
  var disabled = true;

  // Find the number of raid kill achievements
  var progression = function(json, raids) {
    return _(json.progression.raids).chain()
      .select(function(raid){ return _.include(raids, raid.name); })
      .pluck('bosses').flatten().pluck('normalKills')
      .select(function(kills){ return kills > 0; })
      .value().length
  };

  // Find the talent spec along with its icon
  var talent = function(json, idx) {
    var image = json.talents[idx].icon || 'inv_misc_questionmark';
    var selected = json.talents[idx].selected ? 'class="selected" ' : '';
    return '<img src="http://us.media.blizzard.com/wow/icons/18/' + image + '.jpg" ' + selected + '/>';
  };

  // Add a name to the list
  var addName = function(name) {
    $.jsonp({
      url: 'http://us.battle.net/api/wow/character/' + realmSlug + '/' + name + '?fields=items,talents,progression&jsonp=?',
      success: function(data){
        var html = '<p>'
        + talent(data, 0) + talent(data, 1)
        + '<span class="name"><a href="http://us.battle.net/wow/en/character/' + data.realm + '/' + data.name +'/advanced" target="_blank" class="character-class-' + data['class'] + '">' + data.name + '</a></span>'
        + '<a class="remove">&times;</a>'
        + '<span class="progression">(' + progression(data, ['Firelands']) + '|' + progression(data, ['Dragon Soul']) + ')</span>'
        + '<span class="ilvl">(<span class="equipped">' + data.items.averageItemLevelEquipped + '</span>|' + data.items.averageItemLevel + ')</span>'
        + '</p>';
        if ( !_(names).include(data.name) ) {
          names.push(data.name);
          $('#name-list').prepend(html);
          showOrHideNotes();
        }
      },
      error: function() {
        $('#not-found').show().fadeOut();
      }
    });
  };

  // Clear all names from the list
  var clearNames = function() {
    names = [];
    $('#name-list').empty();
    showOrHideNotes();
  }

  // Focus the 'add' input box
  var focusInput = function() {
    $('#add input').focus();
  }

  // Show a description of the data if the list isn't empty
  var showOrHideNotes = function() {
    names.length > 0 ? $('#notes').show() : $('#notes').hide();
  };

  // Change the current realm
  var changeRealm = function(name, slug) {
    realmSlug = slug;
    $('#realm-name').text(name);
    clearNames();
    focusInput();
  };

  // Enable input and realm select
  var enableAll = function() {
    $('#add input').prop('disabled', false);
    $('#realm-dropdown .dropdown-toggle').removeClass('disabled');
    focusInput();
  };
  
  // Populate dropdown menu with realms and select default
  $.jsonp({
    url: "http://us.battle.net/api/wow/realm/status?jsonp=?",
    success: function(data) {
      _(data.realms).each(function(realm) {
        $('#realm-list').append('<li><a href="#" data-slug="' + realm.slug + '">' + realm.name + '</a></li>');
      });
      changeRealm('Azgalor', 'azgalor');
      enableAll();
    },
    error: function() {
      $('#server-down').show();
    }
  });

  // Change the current realm when a dropdown item is selected
  $('#realm-list').on('click', 'a', function(event) {
    changeRealm($(this).text(), $(this).attr('data-slug'));
    event.preventDefault();
  });

  // Add a name to the list when the form is submitted
  $('#add').submit(function() {
    addName($('#add input').val());
    $('#add input').val('');
    return false;
  });

  // Remove a name from the list when X is clicked
  $('#name-list').on('click', '.remove', function() {
    var name = $(this).parent().find('.name a').text();
    names = _(names).without(name);
    showOrHideNotes();
    $(this).parent().remove();
  });
  
  // Disable dropdown toggle when .disabled is present
  $('#realm-dropdown').on('click', '.disabled', function() {return false; });
});
