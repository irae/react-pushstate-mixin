var PushStateMixin = (function() {

  function getAllChildren(){
    var children = this.props.children,
      childrenList = [],
      child;

    if(this.props.children){
      for(var i = 0, l = children.length; i < l; i++){
        child = children[i];

        if(child.state !== undefined && !child.__disablePushState){
          childrenList.push(child);
          childrenList = childrenList.concat(getAllChildren.call(child));
        }

      }
    }

    return childrenList;
  }

  function getStates(){
    var children = getAllChildren.call(this),
      states = {},
      child;

    for(var i = 0, l = children.length; i < l; i++){
      child = children[i];
      if(child.state && child.props.id){
        states[child.props.id] = child.state;
      }
    }

    return states;
  }


  var mixin = {

    componentDidUpdate: function(){
      var states = getStates.call(this);
      window.history.replaceState(states, "", "");
    },

    pushState: function(){
      var states = getStates.call(this);
      // TODO: play nice with states of other systems
      window.history.pushState(states, "", "");
    },

    componentWillMount: function(){
      var children = getAllChildren.call(this),
        child,
        clone,
        self = this;

      for(var i = 0, l = children.length; i < l; i++) {
        child = children[i];

        if(child.props.id){
          clone = child.componentWillUpdate;
          child.componentDidUpdate = function(e){
            if(!this.__disablePushState){
              self.componentDidUpdate();
            }
            clone && clone.call(clone);
          }
          child.pushState = self.pushState;
        }
      }

      window.addEventListener("popstate", function(e){
        var child;
        if(e.state){
          for(var i = 0, l = children.length; i < l; i++){
            child = children[i];
            child.__disablePushState = true;
            child.setState(e.state[child.props.id]);
            child.__disablePushState = false;
          }
        }
        else {
          for(var i = 0, l = children.length; i < l; i++){
            child = children[i];
            child.__disablePushState = true;
            child.setState(child.getInitialState());
            child.__disablePushState = false;
          }
        }
      });
    }
  };

  return mixin;
})();

module ? module.exports = PushStateMixin : null;