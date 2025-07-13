(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })()

  document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("searchInput");
    const suggestionsList = document.getElementById("searchSuggestions");

    if (!input || !suggestionsList) return;

    input.addEventListener("input", async function () {
      const query = this.value;

      if (!query) {
        suggestionsList.innerHTML = "";
        return;
      }

      try {
        const res = await fetch(`/listings/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        suggestionsList.innerHTML = "";
        data.forEach(item => {
          const li = document.createElement("li");
          li.classList.add("list-group-item", "list-group-item-action");
          li.innerText = `${item.title} - ${item.location}`;
          li.addEventListener("click", () => {
            window.location.href = `/listings/${item.id}`;
          });
          suggestionsList.appendChild(li);
        });
      } catch (err) {
        console.error("Search failed", err);
      }
    });

    document.getElementById("searchForm").addEventListener("submit", e => e.preventDefault());
  });
  document.addEventListener("DOMContentLoaded", () => {
    const viewBtn = document.getElementById("viewMessagesBtn");
    const container = document.getElementById("messagesContainer");

    viewBtn.addEventListener("click", () => {
      container.style.display = "block";
      viewBtn.style.display = "none";
    });
  });

