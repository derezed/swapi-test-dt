import React from "react";
import PropTypes from 'prop-types';

const SearchForm = (props) => {
  const handleFormSubmit = (event) => {
    event.preventDefault();
    props.handleFormSubmit();
  }

  return (
    <section
      className="flex flex-col items-center gap-y-10"
    >
      <form className="flex gap-x-5" onSubmit={handleFormSubmit}>
        <div className="flex flex-col">
          <label
            className="text-white"
            htmlFor="selectInput"
          >
            Search a Starship manufacturer
          </label>

          <select
            name="selectInput"
            className="p-2 rounded-sm w-full"
            ref={props.selectInputRef}
            onChange={handleFormSubmit}
          >
            <option value="All">All</option>

            {props.options && props.options.map((manufacturer, index) => {
              return (
                <option key={index} value={manufacturer}>
                  {manufacturer}
                </option>
              )
            })}
          </select>
        </div>
      </form>
    </section>
  );
};

SearchForm.propTypes = {
  handleFormSubmit: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  selectInputRef: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.shape({ current: PropTypes.instanceOf(HTMLInputElement) })
  ]),
}

export default SearchForm;
