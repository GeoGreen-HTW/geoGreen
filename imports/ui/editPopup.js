  import './editPopup.html';
  import { Quests } from '../api/quests.js';
  import { Session } from 'meteor/session';

  
  Template.editPopup.helpers({
    quest: function () {
        var questId = Session.get('m_id');
        var selectedQuest = Quests.findOne({ _id: questId  });
        return selectedQuest;
    }
  });