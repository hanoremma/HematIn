const FinanceTipsCard = ({
  recommendation,
  loadingAi
}) => {

  return (

    <div className="finance-tips-card">

      <h4>
        🤖 Tips Keuangan AI
      </h4>

      {

        loadingAi

        ?

        <p>
          Memuat rekomendasi...
        </p>

        :

        <>

          <div
            style={{
              whiteSpace: "pre-line",
              lineHeight: "1.6",
              fontSize: "13px",
              marginBottom: "15px",
              maxHeight: "180px",
              overflowY: "auto"
            }}
          >

            {

              recommendation?.rekomendasi

              ?

              recommendation.rekomendasi
                .replace(/#/g, "")

              :

              "Belum ada rekomendasi."

            }

          </div>

          <div className="tips-box">

            💰 Total Pengeluaran:

            Rp {

              recommendation?.ringkasan
                ?.total_pengeluaran

                ?

                recommendation.ringkasan.total_pengeluaran
                  .toLocaleString("id-ID")

                :

                "0"

            }

          </div>

        </>

      }

    </div>

  );

};

export default FinanceTipsCard;