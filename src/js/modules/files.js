export const inputFiles = () => {

    const inputs = document.querySelectorAll(".file-btn__input");

    if (inputs.length === 0) return;

    inputs.forEach(inputFile => {
        const dt = new DataTransfer();
        let fileList = inputFile.parentElement.nextElementSibling;


        inputFile.addEventListener('change', (e) => {
            for (var i = 0; i < this.files.length; i++) {
                let fileBlock = document.createElement('div');
                fileBlock.classList.add('file__item')

                let fileName = this.files.item(i).name;

                fileList.appendChild(fileBlock);

            };

            for (let file of this.files) {
                dt.items.add(file);
            }

            $filesList[0].querySelectorAll('.file__item').forEach(fileItem => {

                fileItem.addEventListener('click', function (e) {

                    let name = $(this).text();
                    $(this).remove();

                    for (let i = 0; i < dt.items.length; i++) {
                        if (name === dt.items[i].getAsFile().name) {
                            dt.items.remove(i);
                            continue;
                        }
                    }

                    inputFile.files = dt.files;
                }, {
                    once: true
                });
            });


            this.files = dt.files;

        })

        // $(inputFile).on('change', function (e) {




        //     for (let file of this.files) {
        //         dt.items.add(file);
        //     }

        //     $filesList[0].querySelectorAll('.file__item').forEach(fileItem => {

        //         fileItem.addEventListener('click', function (e) {

        //             let name = $(this).text();
        //             $(this).remove();

        //             for (let i = 0; i < dt.items.length; i++) {
        //                 if (name === dt.items[i].getAsFile().name) {
        //                     dt.items.remove(i);
        //                     continue;
        //                 }
        //             }

        //             inputFile.files = dt.files;
        //         }, {
        //             once: true
        //         });
        //     });


        //     this.files = dt.files;


        // });
    })



};