var PushStateMixin = (function() {

  /**
   * Get all the children for a React Component
   *
   * @returns {Array}
   */
  function getAllChildren(){
    var children = this.props.children,
      childrenList = [],
      child;

    if(children){
      if(!children.length){
        children = [children];
      }

      for(var i = 0, l = children.length; i < l; i++){
        child = children[i];
        if(child.state !== undefined && !child.__disablePushState){
          childrenList.push(child);
        }

        childrenList = childrenList.concat(getAllChildren.call(child));
      }
    }

    return childrenList;
  }

  /**
   * Get states for ReactComponents
   *
   * @returns {{}}
   */
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
      var newHistoryState = window.history.state || {};
      newHistoryState.__reactStates = states;
      window.history.replaceState(newHistoryState, "", "");
    },

    /**
     * Helper function to push to history from component and SubComponents
     */
    pushState: function(){
      var states = getStates.call(this);
      var newHistoryState = window.history.state || {};
      newHistoryState.__reactStates = states;
      window.history.pushState(newHistoryState, "", "");
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
        var state = e.state || window.history.state || {};
        if(state && state.__reactStates){
          for(var i = 0, l = children.length; i < l; i++){
            child = children[i];
            child.__disablePushState = true;
            child.setState(state.__reactStates[child.props.id]);
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

if(!window && exports){
  exports = PushStateMixin;
}