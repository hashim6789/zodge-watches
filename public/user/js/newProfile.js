document.addEventListener("DOMContentLoaded", function () {
  // Handle "Personal Info" link click
  document
    .querySelector('a[href="#personal-info"]')
    .addEventListener("click", function (event) {
      event.preventDefault(); // Prevent the default anchor behavior
      axios
        .get("/user/profile/api/personal-info") // Replace with your actual route
        .then(function (response) {
          // Handle success
          const user = response.data.data; // Assuming your server returns a user object
          console.log(user);
          // Dynamically create and insert the form
          document.getElementById("content-area").innerHTML = `
            <form id="personal-info-form">
              <input type="hidden" class="form-control" id="userId" name="userId" value="${user.id}" required disabled>
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input type="text" class="form-control" id="firstName" name="firstName" value="${user.firstName}" required disabled>
              </div>
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" class="form-control" id="lastName" name="lastName" value="${user.lastName}" required disabled>
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" class="form-control" id="email" name="email" value="${user.email}" required disabled>
              </div>
              <button type="submit" class="btn btn-primary">Edit</button>
            </form>
          `;
        })
        .catch(function (error) {
          // Handle error
          console.error("Error fetching personal information:", error);
          document.getElementById("content-area").innerHTML =
            '<p class="text-danger">Unable to load personal information. Please try again later.</p>';
        });
    });

  // Handle "Edit" button click in Personal Info
  document
    .getElementById("content-area")
    .addEventListener("click", function (event) {
      if (
        event.target &&
        event.target.tagName === "BUTTON" &&
        event.target.textContent === "Edit"
      ) {
        event.preventDefault(); // Prevent default form submission

        // Fetch current user data (this example assumes the data is already fetched)
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;

        // Populate the modal fields with current data
        document.getElementById("modalFirstName").value = firstName;
        document.getElementById("modalLastName").value = lastName;

        // Show the modal
        $("#editPersonalInfoModal").modal("show");
      }
    });

  // Handle form submission in the Personal Info modal
  document
    .getElementById("editPersonalInfoForm")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent default form submission

      // Collect the form data
      const updatedFirstName = document.getElementById("modalFirstName").value;
      const updatedLastName = document.getElementById("modalLastName").value;

      // Send the updated data to the server using Axios
      axios
        .post(`/user/profile/api/personal-info`, {
          firstName: updatedFirstName,
          lastName: updatedLastName,
          // Replace with your actual route
        })
        .then(function (response) {
          alert("Information updated successfully.");

          // Update the displayed information in the main content area
          document.getElementById("firstName").value = updatedFirstName;
          document.getElementById("lastName").value = updatedLastName;

          // Close the modal
          $("#editPersonalInfoModal").modal("hide");
        })
        .catch(function (error) {
          console.error("Error updating personal information:", error);
          alert("Failed to update information. Please try again.");
        });
    });

  // Handle "Address Book" link click
  document
    .querySelector('a[href="#address-book"]')
    .addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default anchor click behavior

      // Clear existing content
      const mainContent = document.querySelector("main");
      mainContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <h2>Address Book</h2>
          <button class="btn btn-primary" id="createAddressButton">Create Address</button>
        </div>
      `; // Set title for Address Book section and add a "Create Address" button

      // Fetch the addresses using Axios
      axios
        .get("/user/profile/api/addresses")
        .then(function (response) {
          const addresses = response.data.data;

          if (addresses.length === 0) {
            // Display message if no addresses are found
            const noAddressMessage = document.createElement("p");
            noAddressMessage.textContent = "There is no address.";
            mainContent.appendChild(noAddressMessage);
          } else {
            const addressList = document.createElement("ul"); // Create an unordered list
            addressList.id = "addressList"; // Set an ID for updating the list dynamically
            addresses.forEach(function (address) {
              const listItem = document.createElement("li"); // Create list item for each address
              listItem.className = "address-item";
              listItem.id = `address-${address._id}`;

              // Generate address display
              listItem.innerHTML = `
                <div>
                  <h5>${address.firstName} ${address.lastName}</h5>
                  <p>
                    ${address.addressLine}<br />
                    ${address.city}, ${address.state}, ${address.pincode}, ${address.flatNo}<br />
                    ${address.country}<br />
                    <small>${address.phoneNo} <br>${address.email} </small>
                  </p>
                </div>
                <button class="btn btn-sm btn-secondary edit-address" data-id="${address._id}">Edit</button>
                <button class="btn btn-sm btn-danger delete-address" data-id="${address._id}">Delete</button>
              `;

              addressList.appendChild(listItem); // Append each list item to the unordered list
            });

            mainContent.appendChild(addressList); // Append the address list to the main content area
          }
        })
        .catch(function (error) {
          console.error("Error fetching addresses:", error);
          alert("Failed to load addresses. Please try again.");
        });
    });

  // Event delegation for "Edit" and "Delete" buttons in Address Book
  document.querySelector("main").addEventListener("click", function (event) {
    if (event.target.classList.contains("edit-address")) {
      // Handle "Edit" button click
      const addressId = event.target.getAttribute("data-id");
      openEditAddressModal(addressId);
    } else if (event.target.classList.contains("delete-address")) {
      // Handle "Delete" button click
      const addressId = event.target.getAttribute("data-id");
      deleteAddress(addressId);
    }
  });

  // Function to open edit modal for Address Book
  function openEditAddressModal(addressId) {
    // Fetch address details using Axios and open modal with pre-filled data
    axios
      .get(`/user/profile/api/address/${addressId}`)
      .then(function (response) {
        const address = response.data.data;
        console.log(address);

        // Populate modal fields
        document.getElementById("editFirstName").value = address.firstName;
        document.getElementById("editAddressId").value = address._id;
        document.getElementById("editLastName").value = address.lastName;
        document.getElementById("editAddressLine").value = address.addressLine;
        document.getElementById("editCity").value = address.city;
        document.getElementById("editState").value = address.state;
        document.getElementById("editZip").value = address.pincode; // Assuming address.pincode is the field in your data
        document.getElementById("editCountry").value = address.country;
        document.getElementById("editPhoneNo").value = address.phoneNo; // Assuming address.phoneNo is the field in your data
        document.getElementById("editFlatNo").value = address.flatNo; // Assuming address.flatNo is the field in your data

        // Show modal using Bootstrap 5
        const editModal = new bootstrap.Modal(
          document.getElementById("editAddressModal")
        );
        editModal.show();
      })
      .catch(function (error) {
        console.error("Error fetching address details:", error);
        alert("Failed to load address details. Please try again.");
      });
  }

  // Event listener for the edit address form submission
  document
    .getElementById("editAddressForm")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent default form submission

      // Get form data
      const addressData = {
        firstName: document.getElementById("editFirstName").value,
        lastName: document.getElementById("editLastName").value,
        addressLine: document.getElementById("editAddressLine").value,
        city: document.getElementById("editCity").value,
        state: document.getElementById("editState").value,
        pincode: document.getElementById("editZip").value, // Assuming this is the ID for the pincode input
        country: document.getElementById("editCountry").value,
        phoneNo: document.getElementById("editPhoneNo").value, // Assuming this is the ID for the phoneNo input
        flatNo: document.getElementById("editFlatNo").value, // Assuming this is the ID for the flatNo input
      };

      // Send update request using Axios
      const addressId = document.getElementById("editAddressId").value; // Assuming this is the ID for the address ID input
      axios
        .put(`/user/profile/api/addresses/${addressId}`, addressData)
        .then(function (response) {
          // Update the address list dynamically
          alert("Address updated successfully.");
          document.querySelector(
            `#address-${addressId} h5`
          ).textContent = `${addressData.firstName} ${addressData.lastName}`;
          document.querySelector(`#address-${addressId} p`).innerHTML = `
            ${addressData.addressLine}<br />
            ${addressData.city}, ${addressData.state}, ${addressData.pincode}, ${addressData.flatNo}<br />
            ${addressData.country}<br />
            <small>${addressData.phoneNo}</small>
          `;

          // Hide modal after update
          const editModal = bootstrap.Modal.getInstance(
            document.getElementById("editAddressModal")
          );
          editModal.hide();
        })
        .catch(function (error) {
          console.error("Error updating address:", error);
          alert("Failed to update address. Please try again.");
        });
    });

  // Delete address function
  function deleteAddress(addressId) {
    axios
      .delete(`/user/profile/api/addresses/${addressId}`)
      .then(function (response) {
        // Remove address from the DOM
        const addressElement = document.getElementById(`address-${addressId}`);
        if (addressElement) {
          addressElement.remove();
        }
        alert("Address deleted successfully.");
      })
      .catch(function (error) {
        console.error("Error deleting address:", error);
        alert("Failed to delete address. Please try again.");
      });
  }

  // Event listener for "Create Address" button click
  document.querySelector("main").addEventListener("click", function (event) {
    if (event.target && event.target.id === "createAddressButton") {
      // Reset modal fields
      document.getElementById("createFirstName").value = "";
      document.getElementById("createLastName").value = "";
      document.getElementById("createAddressLine").value = "";
      document.getElementById("createCity").value = "";
      document.getElementById("createState").value = "";
      document.getElementById("createZip").value = "";
      document.getElementById("createCountry").value = "";
      document.getElementById("createPhoneNo").value = "";
      document.getElementById("createFlatNo").value = "";

      // Show create address modal
      const createModal = new bootstrap.Modal(
        document.getElementById("createAddressModal")
      );
      createModal.show();
    }
  });

  // Event listener for create address form submission
  document
    .getElementById("createAddressForm")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent default form submission

      // Get form data
      const addressData = {
        firstName: document.getElementById("createFirstName").value,
        lastName: document.getElementById("createLastName").value,
        addressLine: document.getElementById("createAddressLine").value,
        city: document.getElementById("createCity").value,
        state: document.getElementById("createState").value,
        pincode: document.getElementById("createZip").value, // Assuming this is the ID for the pincode input
        country: document.getElementById("createCountry").value,
        phoneNo: document.getElementById("createPhoneNo").value, // Assuming this is the ID for the phoneNo input
        flatNo: document.getElementById("createFlatNo").value, // Assuming this is the ID for the flatNo input
      };

      // Send create request using Axios
      axios
        .post("/user/profile/api/addresses", addressData)
        .then(function (response) {
          // Add new address to the list
          const newAddress = response.data.data;
          console.log(newAddress);
          const newAddressElement = document.createElement("li");
          newAddressElement.className = "address-item";
          newAddressElement.id = `address-${newAddress._id}`;
          newAddressElement.innerHTML = `
            <div>
              <h5>${newAddress.firstName} ${newAddress.lastName}</h5>
              <p>
                ${newAddress.addressLine}<br />
                ${newAddress.city}, ${newAddress.state}, ${newAddress.pincode}, ${newAddress.flatNo}<br />
                ${newAddress.country}<br />
                <small>${newAddress.phoneNo} <br>${newAddress.email} </small>
              </p>
            </div>
            <button class="btn btn-sm btn-secondary edit-address" data-id="${newAddress._id}">Edit</button>
            <button class="btn btn-sm btn-danger delete-address" data-id="${newAddress._id}">Delete</button>
          `;
          document.getElementById("addressList").appendChild(newAddressElement);
          alert("Address created successfully.");

          // Hide modal after creating
          const createModal = bootstrap.Modal.getInstance(
            document.getElementById("createAddressModal")
          );
          createModal.hide();
        })
        .catch(function (error) {
          console.error("Error creating address:", error);
          alert("Failed to create address. Please try again.");
        });
    });
});
