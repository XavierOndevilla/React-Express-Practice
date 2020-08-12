import React from "react"
import "./Form.css"

export default class Form extends React.Component {

  constructor(props){
    super(props);
        this.state = {
          serverOutput : null,
          text : '',
          sortType : 'string',
          errorOutput : []
        };

        this.handleSelectorChange = this.handleSelectorChange.bind(this);
        this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
  }

  /*Handle change*/
  handleSelectorChange(event) {
    this.setState({sortType:event.target.value});
  }

  handleTextAreaChange(event) {
    this.setState({text:event.target.value});
  }

  /*Marks the words in an array if the index matches*/
  markWords(array, index1, index2){
    let modArr = [];
    array.forEach(function(value, i) {
      if (i == index1 || i == index2){
        if (i == array.length - 1){
          modArr.push(<mark key={i}>{value}</mark>);
        }
        else{
          modArr.push(<span key={i}><mark>{value}</mark>, </span>);
        }
      }
      else{
        let val = "";
        if (i == array.length - 1){
          val = value;
        }
        else{
          val = value + ", "
        }
        modArr.push(val);
      }
    });
    console.log();
    return modArr;
  }

  /*Handle Validation*/
  handleValidation(){

    this.setState({errorOutput : []});

    let sortType = this.state.sortType;
    let text = this.state.text;
    let array = text.split(",");
    let size = array.length;
    let valid = true;
    let errors = [];

    if(!text){
      errors.push(<p>You must have at least 1 item in your list before you sort.</p>);
      valid = false;
    }

    if(size > 100){
      errors.push(<p>You cannot have more than 100 items!</p>);
      //console.log(size);
      valid = false;
    }

    //check word length
    array.forEach(function(value, i){
      if (sortType === "string" && value.length > 10){
        errors.push(<p>{value} is more than 10 characters</p>);
        valid = false;
      }

      if (!value){
        errors.push(<p>You cannot have an empty item.</p>);
        valid = false;
      }

      if (sortType === "integer" && (parseInt(value, 10) > Number.MAX_SAFE_INTEGER || parseInt(value, 10) < Number.MIN_SAFE_INTEGER)){
        errors.push(<p>You integer values must be between {Number.MAX_SAFE_INTEGER} and {Number.MIN_SAFE_INTEGER}</p>);
        valid = false;
      }
    })

    this.setState({errorOutput : errors});
    console.log(this.state.errorOutput);
    return valid;
  }


  /*Handle the submit event*/
  handleSubmit(event) {
    if(this.handleValidation()){
      const url = 'http://localhost:9000/sorter';
      const data = this.state;

      //clear the output for next submit
      this.setState({serverOutput : ''});

      fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);

          let output = data.map(item =>
            <div key={item.step}>
              <p>Step: {item.step}</p>
              <p>{item.description}</p>
              <p>{this.markWords(item.array.split(","), item.left, item.right)}</p>
              <hr/>
            </div>
          );
          this.setState({serverOutput: output});
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
    event.preventDefault();
  }

  /*Render*/
  render(){
    return (
      <div>
        <div className="errors">{this.state.errorOutput}</div>
        <div>
          <form id="user-form" className="form" onSubmit={this.handleSubmit}>
            <div className="section">
              <label htmlFor="input-type" className="input-type-label">What are you sorting?</label>
              <select id="input-type" className="input-type-select" value={this.state.sortType} onChange={this.handleSelectorChange}>
                <option value="string">Strings</option>
                <option value="integer">Integers</option>
              </select>
              <label htmlFor="textbox-items" className="textbox-items-label">Please enter your comma separated values below: </label>
              <textarea rows={10} cols={30} className="textbox-items-textarea" value={this.state.text} onChange={this.handleTextAreaChange}></textarea>
              <input type="Submit" className="sort-button"/>
            </div>
          </form>
        </div>
        <div className="section">{this.state.serverOutput}</div>
      </div>

    )
  }
}
